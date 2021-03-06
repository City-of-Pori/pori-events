#!/bin/bash
set -exu

# Synchronise local database with selected environment.

# Set paths.
webroot=/app/web

# Set Drush aliases.
site=@tapahtumat
local="$site".local

#Set default syncdb environment.
env=stage

function usage {
  echo "Usage: $0 [prod]"
  exit 1
}

if [ "$#" -gt 1 ]; then
  usage
fi

if [ "$#" -eq 1 ]; then
  if [ "$1" != "prod" ]; then
    usage
  fi
  env=prod
fi

# Synchronize & sanitize database from selected environment.
cd "$webroot"
drush "$local" sql-drop -y
drush sql-sync "$site.$env" "$local" -y
# drush "$site.$env" sql-dump --structure-tables-list=cache,cache_*,history,sessions,watchdog > /app/dump.sql
# drush "$local" sql-drop -y
# drush "$local" sql-query --file=/app/dump.sql -y
# drush "$local" sql:sanitize -y
drush "$local" cc drush
drush "$local" cr
# rm /app/dump.sql
drush "$local" uli
