<?php

namespace Drupal\pori_events_link_formatter\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'link_field_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "link_field_formatter",
 *   label = @Translation("Link field formatter"),
 *   field_types = {
 *     "string"
 *   }
 * )
 */
class LinkFieldFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      // Implement default settings.
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    return [
      // Implement settings form.
    ] + parent::settingsForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    // Implement settings summary.

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    foreach ($items as $delta => $item) {
      $elements[$delta] = ['content' => $this->viewValue($item)];
    }

    return $elements;
  }

  /**
   * Generate the output appropriate for one field item.
   *
   * @param \Drupal\Core\Field\FieldItemInterface $item
   *   One field item.
   *
   * @return array
   *   The textual output generated.
   */
  protected function viewValue(FieldItemInterface $item) {
    $label = preg_replace('#^https?://#', '', $item->getValue()['value']);
    $url = $item->getValue()['value'];

    $url_contents = parse_url($url);

    if (isset($url_contents['scheme'])) {
      $url = '//' . $item->getValue()['value'];
    }

    return ['label' => $label, 'url' => $url];
  }
}
