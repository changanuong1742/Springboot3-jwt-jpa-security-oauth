package com.pos.app.dto.response;

import lombok.Data;

@Data
public class GoogleProfileInfo {
    String sub;
    String name;
    String given_name;
    String family_name;
    String picture;
    String email;
    boolean email_verified;
    String locale;
}
