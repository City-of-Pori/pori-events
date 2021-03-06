#!/bin/sh
# This file manages event node import and cleanup.

# Run migrate commands.
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web migrate:import --group=migrate_source_event --update --sync > /var/log/drush_cron_temp.log 2>&1

# Send the output to journalctl
cat /var/log/drush_cron_temp.log | systemd-cat -p info -t event_import

# Empty the log file to free space for the next run.
cat /dev/null > /var/log/drush_cron_temp.log
