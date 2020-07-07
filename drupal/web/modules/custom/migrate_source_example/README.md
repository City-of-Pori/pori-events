# Migrations on pori-events

There is `function migrate_source_example_migration_plugins_alter(array &$migrations)`
That alters dev, local and lando sites to use test.satakuntaevents. For prod API
testing comment out the environment in question.

Development code for the importers can be found from
`modules/migrate_source_example/config/install`. Hobbies and events use their own migrations.

To check status of Migrations
`drush ms` if total gives null (N/A) then fetching source is failing for some reason.

To run migrations use:
`drush mim --update --group migrate_source_event`
or one migration
`drush mim --update migrate_source_event_event`
you can run migration with dependencies
`drush mim --update --execute-dependencies migrate_source_event_event`

Migrations needs to be idle to start migrating.
`drush mrs migrate_source_event_event` will reset the status.

Automatic running of migration in environments is done by running import script in cron.
`scripts/event_import.sh`. It is ran at /var/spool/cron/nginx on servers.

Custom plugins for migration processes are found in
`modules/src/Plugin/migrate/process`.

To test migrations with your own JSON you can make test.json file to web folder
and use `https://local.tapahtumat.pori.fi/test.json` as urls: parameter. Or use
test.satakuntaevents API or even satakuntaevents API. Both are open.

Making changes to dev files in install folder doesn't work straight away. You need
to run `drush config-import --partial --source=modules/custom/migrate_source_example/modules/migrate_source_example_json/config/install/ -y && drush cr` to import changes to db.

After every change works as intended `drush cex -y` will pull out sync yml for Migrations
which is needed to release to other environments.

Cron does rollback (prod,stage,dev) to remove events that have been removed from JSON that API returns.
`drush mr migrate_source_event_event`

To reindex imported events/hobbies use. May help if something is wrong.
`drush eshd -y && drush eshs event_index && drush eshr event_index && drush queue-run elasticsearch_helper_indexing && drush cron && drush cr`

!IMPORTANT keep development yml files the same as sync/ yml files so partial import
doesn't do unwanted changes later.

## List of migrations and sources updated 21.10.2019
migrate_source_event_area | https://satakuntaevents.fi/api/v2/place/?no_parent=true&page_size=99
migrate_source_event_area_subterms | https://satakuntaevents.fi/api/v2/place/?parent=se:13&is_address=false&page_size=99
migrate_source_event_audience | https://satakuntaevents.fi/api/v2/keyword_set/pori:audiences/?include=keywords&page_size=999
migrate_source_event_event | https://satakuntaevents.fi/api/v2/event/?page_size=999999&include=location,keywords,audience&start=today
migrate_source_event_hobby_area_subterms | https://satakuntaevents.fi/activity/api/v1/place/?page_size=100&is_address=false&parent=se:13
migrate_source_event_hobby_area | https://satakuntaevents.fi/activity/api/v1/place/?is_address=false&page_size=100&no_parent=true
migrate_source_event_hobby_audience | https://satakuntaevents.fi/activity/api/v1/keyword_set/?include=keywords&usage=audience
migrate_source_event_hobby | https://satakuntaevents.fi/activity/api/v1/event/?include=location,keywords,audience&page_size=999999&start=today
migrate_source_event_keywords_hobby_subterms | https://satakuntaevents.fi/activity/api/v1/keyword_set/?include=keywords&usage=keyword
migrate_source_event_keywords_hobby | https://satakuntaevents.fi/activity/api/v1/keyword_set/?include=keywords&usage=keyword
migrate_source_event_keywords | https://satakuntaevents.fi/api/v2/keyword_set/pori:topics/?include=keywords&page_size=999

Migration example readme content below.
<!-- # Migrate source example

`migrate_source_example` is a module that contains a set of sub-modules that provide content migrations from different
sources.

Currently the project features migrations from following sources:

1. External (non-Drupal) database tables.
2. CSV files;
3. XML files;
4. JSON resources.

## Installation

1. Install Drupal 8 compatible `drush`.
2. Install Drupal 8 using `Standard` profile.
3. Download `migrate_tools` contrib module into `modules/contrib/migrate_tools` (see [instructions](https://www.drupal.org/project/migrate_tools/git-instructions)).
4. Download `migrate_plus` contrib module into `modules/contrib/migrate_plus` (see [instructions](https://www.drupal.org/project/migrate_plus/git-instructions)).
5. Enable `migrate_source_example` module (`drush en migrate_source_example`).

### Installation of DB migration example module
1. Enable `migrate_source_example_db` module (`drush en migrate_source_example_db`).

### Installation of CSV migration example module
1. Download `migrate_source_csv` contrib module into `modules/contrib/migrate_source_csv` (see [instructions](https://www.drupal.org/project/migrate_source_csv/git-instructions)).
2. Enable `migrate_source_example_csv` module (`drush en migrate_source_example_csv`).

### Installation of XML migration example module
1. Enable `migrate_source_example_xml` module (`drush en migrate_source_example_xml`).

### Installation of JSON migration example module
1. Enable `migrate_source_example_json` module (`drush en migrate_source_example_json`).

## Usage

1. Run `drush ms` to see all migrations.
2. Run `drush mi --group=[GROUP]` to import content from specific example group.

## Special usage of JSON migration example

JSON migration source plugin requires an absolute URL of a JSON resource to be set in migration .yml file due to
an assumption that JSON resources are remote. It means that for JSON migration to work, a base url of the site
needs to be provided to migration system.

Run `drush mi --group=migrate_source_example_json --uri=[BASE_URL]`, where `[BASE_URL]` is an absolute path to your
site.

## Data source

Example content is synced with a [Google Spreadsheet](https://goo.gl/Iq2Tk6). -->
