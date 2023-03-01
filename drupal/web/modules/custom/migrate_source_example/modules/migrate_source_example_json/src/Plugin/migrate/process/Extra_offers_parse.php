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
 *   id = "extra_offers_parse",
 * )
 */
class Extra_offers_parse extends ProcessPluginBase {
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    // Return 1 if extra option is set.
    $source_extra_options = $row->getSource()['extra_options'] ?? [];
    $return_boolean = 0;

    // Is it super event?
    if ($destination_property == 'field_super_event' && !empty($row->getSource()['event_super_event'])) {
      $return_boolean = 1;
    }

    if(empty($source_extra_options)) {
      // If no extra options then return 0
      return $return_boolean;
    }
    if ($destination_property == 'field_child_care') {
      foreach ($source_extra_options as $val) {
        if (isset($val['child-care'])) {
          $return_boolean = 1;
        }
      }
    }
    else if ($destination_property == 'field_accessible') {
      foreach ($source_extra_options as $val) {
        if (isset($val['accessible'])) {
          $return_boolean = 1;
        }
      }
    }
    else if ($destination_property == 'field_culture_and_or_activity_no') {
      foreach ($source_extra_options as $val) {
        if (isset($val['sport-benefit'])) {
          $return_boolean = 1;
        }
      }
    }
    else if ($destination_property == 'field_super_event') {
      foreach ($source_extra_options as $val) {
        if (isset($val['super-event'])) {
          $return_boolean = 1;
        }
      }
    }
    return $return_boolean;
  }
}
