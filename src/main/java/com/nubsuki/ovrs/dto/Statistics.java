package com.nubsuki.ovrs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Statistics {
    private long userCount;
    private long orderCount;
    private long vehicleCount;
}
