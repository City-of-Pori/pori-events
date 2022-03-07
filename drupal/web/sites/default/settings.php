<?php

/**
 * General settings.php for all environments.
 * You could use this to add general settings to be used for all environments.
 */

/**
 * Database settings (overridden per environment)
 */
// $databases = [];
$databases['default']['default'] = [
  'database' => getenv('DB_NAME_DRUPAL'),
  'username' => getenv('DB_USER_DRUPAL'),
  'password' => getenv('DB_PASS_DRUPAL'),
  'prefix' => '',
  'host' => getenv('DB_HOST_DRUPAL'),
  'port' => '3306',
  'namespace' => 'Drupal\\Core\\Database\\Driver\\mysql',
  'driver' => 'mysql',
];

// CHANGE THIS.
$settings['hash_salt'] = 'some-hash-salt-please-change-this';

if ((isset($_SERVER["HTTPS"]) && strtolower($_SERVER["HTTPS"]) == "on")
  || (isset($_SERVER["HTTP_X_FORWARDED_PROTO"]) && $_SERVER["HTTP_X_FORWARDED_PROTO"] == "https")
  || (isset($_SERVER["HTTP_HTTPS"]) && $_SERVER["HTTP_HTTPS"] == "on")
) {
  $_SERVER["HTTPS"] = "on";

  // Tell Drupal we're using HTTPS (url() for one depends on this).
  $settings['https'] = TRUE;
}

// @codingStandardsIgnoreStart
if (isset($_SERVER['REMOTE_ADDR'])) {
  $settings['reverse_proxy'] = TRUE;
  $settings['reverse_proxy_addresses'] = [$_SERVER['REMOTE_ADDR']];
}
// @codingStandardsIgnoreEnd

if (!empty($_SERVER['SERVER_ADDR'])) {
  // This should return last section of IP, such as "198". (dont want/need to expose more info).
  //drupal_add_http_header('X-Webserver', end(explode('.', $_SERVER['SERVER_ADDR'])));
  $pcs = explode('.', $_SERVER['SERVER_ADDR']);
  header('X-Webserver: ' . end($pcs));
}

$env = getenv('WKV_SITE_ENV');
switch ($env) {
  case 'prod':
    $conf['simple_environment_indicator'] = '#560004 Production';
    $config['google_tag.container.tapahtumat.pori.fi']['environment_id'] = 'env-1';
    $config['google_tag.container.tapahtumat.pori.fi']['environment_token'] = 'gW_rBBg5Mg2OmD-o7G464g';
    break;

  case 'dev':
    $settings['simple_environment_indicator'] = '#004984 Development';
    break;

  case 'stage':
    $settings['simple_environment_indicator'] = '#e56716 Stage';
    break;

  case 'local':
    $settings['simple_environment_indicator'] = 'DarkGreen Local';
    $conf['stage_file_proxy_origin'] = 'https://tapahtumat.pori.fi';
    break;

}
/**
 * Location of the site configuration files.
 */
$config_directories = [];

// Location of the site configuration files.
$settings['config_sync_directory'] = '../sync';

// Set default trusted hosts.
$settings['trusted_host_patterns'] = array(
  '^pori-events\.lndo\.site$',
  '^local\.pori-events\.fi$',
  '^local\.tapahtumat\.pori\.fi$',
  '^pori-events\.dev\.wunder\.io$',
  '^pori-events\.stage\.wunder\.io$',
  '^pori-events\.prod\.wunder\.io$',
  '^tapahtumat\.pori\.fi$',
);

/**
 * Access control for update.php script.
 */
$settings['update_free_access'] = FALSE;

/**
 * Load services definition file.
 */
$settings['container_yamls'][] = __DIR__ . '/services.yml';

// Warden settings.
// Shared secret between the site and Warden server.
$config['warden.settings']['warden_token'] = getenv('WARDEN_TOKEN');
// Location of your Warden server. No trailing slash.
$config['warden.settings']['warden_server_host_path'] = 'https://warden.wunder.io';
// Allow external callbacks to the site. When set to FALSE pressing refresh site
// data in Warden will not work.
$config['warden.settings']['warden_allow_requests'] = TRUE;
// Basic HTTP authorization credentials.
$config['warden.settings']['warden_http_username'] = 'warden';
$config['warden.settings']['warden_http_password'] = 'wunder';
// IP address of the Warden server. Only these IP addresses will be allowed to
// make callback # requests.
$config['warden.settings']['warden_public_allow_ips'] = '35.228.188.78,35.228.81.50';
// Define module locations.
$config['warden.settings']['warden_preg_match_custom'] = '{^modules\/custom\/*}';
$config['warden.settings']['warden_preg_match_contrib'] = '{^modules\/contrib\/*}';
$config['warden.settings']['warden_match_contrib'] = TRUE;

/**
 * Environment specific override configuration, if available.
 */
if (file_exists(__DIR__ . '/settings.local.php')) {
  include __DIR__ . '/settings.local.php';
}

/**
 * Lando configuration overrides.
 */
if (getenv('LANDO_INFO') && file_exists($app_root . '/' . $site_path . '/settings.lando.php')) {
  include $app_root . '/' . $site_path . '/settings.lando.php';
}
