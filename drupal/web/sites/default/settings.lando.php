<?php

/**
 * @file
 * Settings for Lando environment.
 */

/**
 * Load database credentials from Lando app environment.
 */
$lando_info = json_decode(getenv('LANDO_INFO'), TRUE);
$databases['default']['default'] = [
  'driver' => 'mysql',
  'database' => $lando_info['database']['creds']['database'],
  'username' => $lando_info['database']['creds']['user'],
  'password' => $lando_info['database']['creds']['password'],
  'host' => $lando_info['database']['internal_connection']['host'],
  'port' => $lando_info['database']['internal_connection']['port'],
];

// Skip file system permissions hardening in local development with Lando.
$settings['skip_permissions_hardening'] = TRUE;

// Skip trusted host pattern when using Lando.
$settings['trusted_host_patterns'] = ['.*'];

// Disable CSS and JS aggregation.
$config['system.performance']['css']['preprocess'] = FALSE;
$config['system.performance']['js']['preprocess'] = FALSE;

// Enable local development services.
$settings['container_yamls'][] = DRUPAL_ROOT . '/sites/development.services.yml';

// Set ElasticSearch Helper settings (hostname & port for local).
$config['elasticsearch_helper.settings']['hosts'][0]['host'] = 'elasticsearch-tapahtumat.lndo.site';
$config['elasticsearch_helper.settings']['hosts'][0]['port'] = "9400";

// simple_environment_indicator settings.
$settings['simple_environment_indicator'] = '#88b700 Local';

// stage_file_proxy_origin settings.
$conf['stage_file_proxy_origin'] = 'https://tapahtumat.pori.fi';
