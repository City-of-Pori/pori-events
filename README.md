# tapahtumat.pori.fi

The [tapahtumat.pori.fi](https://tapahtumat.pori.fi/) calendar contains all the events and activities near Pori.

## Local development

### Setup

1. Read the [Lando docs](https://docs.lando.dev/) and install the **latest** [Lando](https://github.com/lando/lando/releases).
2. Check out the repo: `git clone git@github.com:City-of-Pori/pori-events.git tapahtumat && cd tapahtumat/drupal`.
3. Start the site: `lando start`.
4. Sync the local database with selected environment: `lando syncdb <env>` (`stage` by default, `prod`). Connect to the required VPN first.
5. Update the local database & enable development components: `lando update`.
6. Go to <https://tapahtumat.lndo.site/>.

### Services

- <https://adminer-tapahtumat.lndo.site> - Adminer for database management, log in **without** entering the credentials.
- <https://mail-tapahtumat.lndo.site> - Mailhog for mail management.

### Tools

Full commands/tools overview is available by running `lando`. Custom tools:

- `lando bower`, `lando gulp`, `lando npm` - frontend tooling,
- `lando index` - sets up the elasticsearch indexes,
- `lando update` - updates the local db & enables dev components,
- `lando migrate` - imports migrate_source_event migration group,
- `lando xdebug-on` - enables xdebug,
- `lando xdebug-off` - disables xdebug.

[Old readme](README_old.md).
