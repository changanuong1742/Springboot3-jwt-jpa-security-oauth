package com.pos.app.controllers;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.pos.app.dto.response.AuthenticationResponse;
import com.pos.app.dto.response.GoogleAuthUrl;
import com.pos.app.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;

@RestController
@RequestMapping("/api/google")
@RequiredArgsConstructor
public class GoogleAuth {
    private final AuthenticationService authenticationService;
    @Value("${spring.security.oauth2.resourceserver.opaque-token.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.resourceserver.opaque-token.client-secret}")
    private String clientSecret;

    @GetMapping("/get-url-auth")
    public ResponseEntity<GoogleAuthUrl> auth() {
        String url = new GoogleAuthorizationCodeRequestUrl(clientId,
                "http://localhost:4200",
                Arrays.asList(
                        "email",
                        "profile",
                        "openid")).build();
        return ResponseEntity.ok(new GoogleAuthUrl(url));
    }

    @GetMapping("/callback")
    public AuthenticationResponse callback(@RequestParam("code") String code) throws URISyntaxException, IOException {
        return ResponseEntity.ok(authenticationService.authenticateGoogle(code)).getBody();
    }
}
