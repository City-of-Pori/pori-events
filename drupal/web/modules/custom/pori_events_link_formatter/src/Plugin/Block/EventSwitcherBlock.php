<?php

namespace Drupal\pori_events_link_formatter\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Event Switcher' Block.
 *
 * @Block(
 *   id = "event_switcher",
 *   admin_label = @Translation("Event Switcher"),
 *   category = @Translation("Pori Events"),
 * )
 */
class EventSwitcherBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return ['#theme' => 'pori-events'];
  }

}
