#!/bin/sh
# This file manages event node import and cleanup.

# Stop & reset potentially stuck migrations.
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_area
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_area

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_keywords_hobby
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_keywords_hobby

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_area_subterms
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_area_subterms

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_keywords_hobby_subterms
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_keywords_hobby_subterms

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_audience
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_audience

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_hobby_audience
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_hobby_audience

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_hobby_area
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_hobby_area

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_keywords
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_keywords

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_hobby_area_subterms
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_hobby_area_subterms

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_event
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_event

/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mst migrate_source_event_hobby
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web mrs migrate_source_event_hobby

# Run migrate commands.
/usr/lib/composer/vendor/bin/drush --root=/var/www/pori-events.${WKV_SITE_ENV}.wunder.io/current/web migrate:import --group=migrate_source_event --update --sync > /var/log/drush_cron_temp.log 2>&1

# Send the output to journalctl
cat /var/log/drush_cron_temp.log | systemd-cat -p info -t event_import

# Empty the log file to free space for the next run.
cat /dev/null > /var/log/drush_cron_temp.log
