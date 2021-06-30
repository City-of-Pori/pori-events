<?php

namespace Drupal\pori_events_link_formatter\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Hobby Switcher' Block.
 *
 * @Block(
 *   id = "hobbyswitcher",
 *   admin_label = @Translation("Hobby Switcher"),
 *   category = @Translation("Pori Events"),
 * )
 */
class HobbySwitcherBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return ['#theme' => 'pori-events'];
  }

}
