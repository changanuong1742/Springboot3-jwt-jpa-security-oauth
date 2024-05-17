package com.pos.app.services;


import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.pos.app.dto.request.AuthenticationRequest;
import com.pos.app.dto.request.RegisterRequest;
import com.pos.app.dto.response.AuthenticationResponse;
import com.pos.app.dto.response.GoogleProfileInfo;
import com.pos.app.dto.response.ResponseData;
import com.pos.app.dto.response.ResponseMessage;
import com.pos.app.models.Image;
import com.pos.app.models.Token;
import com.pos.app.models.User;
import com.pos.app.repositories.ImageRepository;
import com.pos.app.repositories.TokenRepository;

import com.pos.app.repositories.UserRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.errors.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final ImageRepository imageRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    ResponseData responseData = new ResponseData();

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    @Value("${minio.bucketName}")
    private String bucketName;

    @Value("${spring.security.oauth2.resourceserver.opaque-token.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.resourceserver.opaque-token.client-secret}")
    private String clientSecret;

    private final MinioClient minioClient;

    public ResponseEntity<?> register(RegisterRequest request) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new ResponseEntity<>("email is already taken !", HttpStatus.CONFLICT);
        } else {
            String originalFilename = Instant.now().toEpochMilli() + "-" + request.getFile().getOriginalFilename();
            String[] filenameParts = originalFilename.split("\\.");
            String fileType = filenameParts[filenameParts.length - 1];

            InputStream inputStream = request.getFile().getInputStream();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(originalFilename)
                    .stream(inputStream, inputStream.available(), -1)
                    .build());

            var avatar = Image.builder().type(fileType).fileName(originalFilename).build();
            var user = User.builder()
                    .firstname(request.getFirstname())
                    .lastname(request.getLastname())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .build();

            var savedUser = userRepository.save(user);
            var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);
            saveUserToken(savedUser, jwtToken, "token");
            saveUserToken(savedUser, refreshToken, "refreshToken");
            imageRepository.save(avatar);

            return new ResponseEntity<>(AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .build(), HttpStatus.OK);
        }
    }

    public ResponseEntity<?> authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            var user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow();

            var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);

            saveUserToken(user, jwtToken, "token");
            saveUserToken(user, refreshToken, "refreshToken");

            Map<String, Object> dataMap = new HashMap<>();
            dataMap.put("access_token", jwtToken);
            dataMap.put("refresh_token", refreshToken);
            dataMap.put("user_id", user.getId());
            responseData.setData(dataMap);
            responseData.setMessage("Authentication success");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (AuthenticationException e) {
            responseData.setMessage("Login information is incorrect");
            return new ResponseEntity<>(responseData, HttpStatus.NOT_FOUND);
        }
    }

    private void saveUserToken(User user, String jwtToken, String typeToken) {

        Optional<Token> existingToken = tokenRepository.findByToken(jwtToken);
        if (existingToken.isPresent()) {
            Token tokenToUpdate = existingToken.get();
            tokenToUpdate.setToken(jwtToken);
            tokenToUpdate.setExpired(new Date(System.currentTimeMillis() + (Objects.equals(typeToken, "token") ? jwtExpiration : refreshExpiration)));
            tokenRepository.save(tokenToUpdate);
        } else {
            var token = Token.builder()
                    .user(user)
                    .token(jwtToken)
                    .expired(new Date(System.currentTimeMillis() + (Objects.equals(typeToken, "token") ? jwtExpiration : refreshExpiration)))
                    .build();
            tokenRepository.save(token);
        }

    }

    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        refreshToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            var user = this.userRepository.findByEmail(userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                var accessRefreshToken = jwtService.generateRefreshToken(user);
                saveUserToken(user, accessToken, "token");
                saveUserToken(user, accessRefreshToken, "refreshToken");
                var authResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken).userId(String.valueOf(user.getId()))
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }

    public AuthenticationResponse authenticateGoogle(String code) throws IOException {
        String token;
        token = new GoogleAuthorizationCodeTokenRequest(
                new NetHttpTransport(), new GsonFactory(),
                clientId,
                clientSecret,
                code,
                "http://localhost:4200"
        ).execute().getAccessToken();
        return getGoogleProfile(token);
    }

    public AuthenticationResponse getGoogleProfile(String token) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + token;
        RestTemplate restTemplate = new RestTemplate();
        GoogleProfileInfo googleProfileInfo = restTemplate.getForObject(userInfoUrl, GoogleProfileInfo.class);

        Optional<User> optionalUser = userRepository.findByEmail(googleProfileInfo.getEmail());

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);
            saveUserToken(user, jwtToken, "token");
            saveUserToken(user, refreshToken, "refreshToken");

            return AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .userId(String.valueOf(user.getId()))
                    .build();
        } else {
            var avatar = Image.builder().type("text").fileName(googleProfileInfo.getPicture()).build();
            var user = User.builder()
                    .firstname(googleProfileInfo.getGiven_name())
                    .lastname(googleProfileInfo.getFamily_name())
                    .email(googleProfileInfo.getEmail())
                    .password(passwordEncoder.encode("1"))
                    .build();
            var savedUser = userRepository.save(user);
            var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);
            saveUserToken(savedUser, jwtToken, "token");
            saveUserToken(savedUser, refreshToken, "refreshToken");

            return AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .userId(String.valueOf(user.getId()))
                    .build();
        }
    }
}
