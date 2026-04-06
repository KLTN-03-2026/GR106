package com.farmapp.farmsmartmanagement.modules.plot.dto.request;

import java.util.List;

public record GeometryFormat(
        String type, // "Polygon"

        List<List<List<Double>>> coordinates
){ }

// Example
//"geometry": {
//    "type": "Polygon",
//    "coordinates": [
//      [
//        [108.2022, 16.0544],
//        [108.2030, 16.0544],
//        [108.2030, 16.0550],
//        [108.2022, 16.0550],
//        [108.2022, 16.0544]
//      ]
//    ]
//  }