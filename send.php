<?php
// Only accept form submissions
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.html');
    exit;
}

// Honeypot: bots fill this hidden field, humans don't
if (!empty($_POST['bot-field'])) {
    header('Location: thanks.html');
    exit;
}

$name    = trim(strip_tags($_POST['name'] ?? ''));
$name    = str_replace(["\r", "\n"], '', $name);
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$message = trim($_POST['message'] ?? '');

if ($name === '' || !$email || $message === '') {
    header('Location: contact.html');
    exit;
}

$to      = 'tommaco123@gmail.com';
$subject = "Portfolio contact from $name";
$body    = "Name: $name\nEmail: $email\n\n$message";
$headers = "From: Portfolio <noreply@michaelsych.com>\r\n" .
           "Reply-To: $email\r\n";

mail($to, $subject, $body, $headers);

header('Location: thanks.html');
exit;