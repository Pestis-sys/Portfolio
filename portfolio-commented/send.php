<?php
/* =========================================================
   send.php — handles the contact form on contact.html
   ---------------------------------------------------------
   The form posts here (action="send.php"). This script checks
   the input, emails it to me, then sends the visitor to
   thanks.html.

   Main reference: the official PHP manual
   https://www.php.net/manual/en/
   ========================================================= */

// Only accept form submissions (POST). Anyone opening this file
// directly in a browser (GET) gets sent back to the form.
// $_SERVER holds info about the request.
// https://www.php.net/manual/en/reserved.variables.server.php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // header('Location: …') redirects the browser to another page.
    // https://www.php.net/manual/en/function.header.php
    header('Location: contact.html');
    // Always exit after a redirect so nothing else runs.
    // https://www.php.net/manual/en/function.exit.php
    exit;
}

// Honeypot: a hidden field that people never see, but spam bots fill in.
// If it has anything in it, pretend it worked and send nothing.
// $_POST holds the submitted form fields, by their name="" attribute.
// https://www.php.net/manual/en/reserved.variables.post.php
// https://www.php.net/manual/en/function.empty.php
if (!empty($_POST['bot-field'])) {
    header('Location: thanks.html');
    exit;
}

// ---------------------------------------------------------
// Clean up the input
// ---------------------------------------------------------

// ?? is the null coalescing operator: use '' if the field is missing.
// https://www.php.net/manual/en/language.operators.comparison.php#language.operators.comparison.coalesce
// trim() removes spaces from both ends.
// https://www.php.net/manual/en/function.trim.php
// strip_tags() removes any HTML tags someone types in.
// https://www.php.net/manual/en/function.strip-tags.php
$name    = trim(strip_tags($_POST['name'] ?? ''));

// Remove line breaks from the name. This blocks "header injection",
// where a spammer sneaks extra email headers in via line breaks.
// https://www.php.net/manual/en/function.str-replace.php
$name    = str_replace(["\r", "\n"], '', $name);

// filter_var with FILTER_VALIDATE_EMAIL returns the email if it's valid,
// or false if it isn't. A valid email can't contain line breaks either.
// https://www.php.net/manual/en/function.filter-var.php
// https://www.php.net/manual/en/filter.filters.validate.php
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);

$message = trim($_POST['message'] ?? '');

// If anything is missing or the email is invalid, go back to the form.
// (The HTML "required" attributes catch this first; this is the backup
// in case someone gets around the browser checks.)
if ($name === '' || !$email || $message === '') {
    header('Location: contact.html');
    exit;
}

// ---------------------------------------------------------
// Build and send the email
// ---------------------------------------------------------
$to      = 'tommaco123@gmail.com';

// Double-quoted strings fill in $variables automatically.
// \n is a new line inside the email body.
// https://www.php.net/manual/en/language.types.string.php#language.types.string.parsing
$subject = "Portfolio contact from $name";
$body    = "Name: $name\nEmail: $email\n\n$message";

// Email headers must be separated by \r\n.
// From: must be an address on my own domain or IONOS/Gmail may block it.
// Reply-To: means hitting Reply in Gmail goes to the visitor.
$headers = "From: Portfolio <noreply@michaelsych.com>\r\n" .
           "Reply-To: $email\r\n";

// mail() hands the email to the server's mail system (IONOS).
// https://www.php.net/manual/en/function.mail.php
mail($to, $subject, $body, $headers);

// Done: show the thank-you page.
header('Location: thanks.html');
exit;
