<?php

function parseIncomingRequest() {
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = $_SERVER['REQUEST_URI'];

    $path = parse_url($uri, PHP_URL_PATH);

    $cleanedPath = trim($path, '/');
    $segments = explode('/', $cleanedPath);

    if (!isset($segments[0]) || $segments[0] !== 'api' || !isset($segments[1]) || $segments[1] !== 'todos') {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Endpoint not found. Valid paradigm is /api/todos"
        ]);

        exit();
    }

    $id = null;
    if (isset($segments[2]) && $segments[2] !== '') {
        $id = (int) $segments[2];
    }

    return [
        "method" => $method,
        "id" => $id
    ];
}