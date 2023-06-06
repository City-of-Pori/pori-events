#!/bin/sh
set -exu

# Re-index Elasticsearch.
cd /app/web
drush cr
drush eshd -y
drush eshs -y
drush eshr -y
drush queue-run elasticsearch_helper_indexing
drush cron
drush cr
