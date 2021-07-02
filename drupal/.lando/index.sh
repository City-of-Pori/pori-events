#!/bin/bash
set -exu

# This file sets up elasticsearch indexes.

# Index elasticsearch.
local=@tapahtumat.local

drush "$local" cr
drush "$local" eshd -y
drush "$local" eshs event_index
drush "$local" eshr event_index
drush "$local" queue-run elasticsearch_helper_indexing
drush "$local" cron
drush "$local" cr
