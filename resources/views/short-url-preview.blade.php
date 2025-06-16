<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Short URL' }}</title>
    <meta property="og:title" content="{{ $title ?? 'Short URL' }}" />
    <meta property="og:url" content="{{ $original_url }}" />
    <meta property="og:type" content="website" />
    <meta property="og:description" content="URL shortener" />
    <meta property="og:image" content="{{ asset('logo.svg') }}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{ $title ?? 'Short URL' }}" />
    <meta name="twitter:description" content="URL shortener" />
    <meta name="twitter:image" content="{{ asset('logo.svg') }}" />
</head>
<body>
    <h1>{{ $title ?? 'Short URL' }}</h1>
    <p>Redirecting to <a href="{{ $original_url }}">{{ $original_url }}</a>...</p>
</body>
</html>
