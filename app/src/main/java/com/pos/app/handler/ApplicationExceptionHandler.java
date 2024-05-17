package com.pos.app.handler;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class ApplicationExceptionHandler {
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, List<Map<String, Object>>> handleInvalidArgument(MethodArgumentNotValidException ex) {
        Map<String, List<Map<String, Object>>> errorMap = new HashMap<>();
        List<Map<String, Object>> errorsList = new ArrayList<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            Map<String, Object> errorDetail = new HashMap<>();
            String fieldName = error.getField();
            String message = error.getDefaultMessage();

            // Check if the field already exists in errorMap
            boolean fieldExists = false;
            for (Map<String, Object> existingError : errorsList) {
                if (existingError.get("name").equals(fieldName)) {
                    // If exists, add the message to the existing list
                    ((List<String>) existingError.get("message")).add(message);
                    fieldExists = true;
                    break;
                }
            }

            // If not exists, create a new entry in errorsList
            if (!fieldExists) {
                List<String> messagesList = new ArrayList<>();
                messagesList.add(message);
                errorDetail.put("name", fieldName);
                errorDetail.put("message", messagesList);
                errorsList.add(errorDetail);
            }
        });

        errorMap.put("errors", errorsList);
        return errorMap;
    }

}
