<?php
// BrainRush settings — TEMPLATE.
// Copy this file to api/config.php and fill in your own values.
// api/config.php is git-ignored; never commit real credentials.

return [
    // Database (on Hostinger the host is usually 'localhost'; see docs/deploy-hostinger.md).
    'host'     => '127.0.0.1',
    'port'     => 3306,
    'dbname'   => 'brainrush',
    'user'     => 'your_db_user',
    'password' => 'your_db_password',

    // Admin login for changing content (HTTP Basic Auth on POST/PUT/DELETE).
    // Leave BOTH empty for local use: changes are then allowed only from this
    // computer (localhost), and refused (403) from anywhere else.
    // For a public site set both:
    //   admin_user          - the login name, e.g. 'quizmaster'
    //   admin_password_hash - output of password_hash(), NEVER the plain password.
    // Generate the hash without the password landing in your shell history
    // (works in bash, cmd.exe and PowerShell; with XAMPP use C:\xampp\php\php.exe):
    //   php -r "echo password_hash(trim(fgets(STDIN)), PASSWORD_DEFAULT), PHP_EOL;"
    // then type the password, press Enter, and paste the printed line
    // (it starts with $2y$) between the SINGLE quotes below. Double quotes would
    // break the hash, because PHP expands the $ parts inside them.
    'admin_user'          => '',
    'admin_password_hash' => '',
];
