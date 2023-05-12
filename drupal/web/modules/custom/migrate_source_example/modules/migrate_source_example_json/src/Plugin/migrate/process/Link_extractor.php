<?php

/**
 * @file
 * Contains \Drupal\migrate_source_example\Plugin\migrate\process\Extra_offers_parse.
 */

namespace Drupal\migrate_source_example_json\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateException;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * @MigrateProcessPlugin(
 *   id = "link_extractor",
 *   handle_multiples = TRUE
 * )
 */
class Link_extractor extends ProcessPluginBase {
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    // Return array of link uri/title pairs.
    $ret = [];
    if (!empty($value)) {
      foreach ($value as $key => $link) {
        $ret[$key]['uri'] = $link['link'] ?? [];
        $ret[$key]['title'] = $link['name'] ?? '';
      }
    }
    return $ret;
  }
}
