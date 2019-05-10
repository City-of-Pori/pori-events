<?php

namespace Drupal\events2elastic\Plugin\Normalizer;

use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\serialization\Normalizer\ContentEntityNormalizer;
use Drupal\Core\Field\FieldItemList;

/**
 * Normalizes / denormalizes Drupal nodes into an array structure good for ES.
 */
class NodeNormalizer extends ContentEntityNormalizer {
  /**
   * The interface or class that this Normalizer supports.
   *
   * @var array
   */
  protected $supportedInterfaceOrClass = ['Drupal\node\Entity\Node'];
  /**
   * Supported formats.
   *
   * @var array
   */
  // protected $format = ['elasticsearch_helper'];

  /**
   * {@inheritdoc}
   */
  public function normalize($object, $format = NULL, array $context = []) {
    /** @var \Drupal\node\Entity\Node $object */


    $bundle = $object->bundle();
    // Get the object language.
    $langcode = $object->language()->getId();
    // Common for all bundles.
    $data = [
      'id' => $object->id(),

      'uuid' => $object->uuid(),
      'title' => $object->getTitle(),
      'status' => $object->isPublished(),
      'bundle' => $bundle,
      'created' => $object->getCreatedTime(),
      'url' => $object->url(),
    ];
    if ($bundle == 'event') {
      // area term
      if ($object->field_area->target_id) {
        $term_name = Term::load($object->field_area->target_id)->get('name')->value;
        $data['area'] = $term_name;
      }
      if ($object->field_hobby_area->target_id) {
        $term_name = Term::load($object->field_hobby_area->target_id)->get('name')->value;
        $data['hobby_area'] = $term_name;
      }


      // audience term
      foreach ($object->field_target_audience as $term) {
        if ($term->target_id) {
          $term_name = Term::load($term->target_id)->get('name')->value;
          $data['audience'][] = $term_name;
        }
      }
      foreach ($object->field_hobby_audience as $term) {
        if ($term->target_id) {
          $term_name = Term::load($term->target_id)->get('name')->value;
          $data['hobby_audience'][] = $term_name;
        }
      }

      // type term
      foreach ($object->field_event_type as $term) {
        if ($term->target_id) {
          $term_name = Term::load($term->target_id)->get('name')->value;
          $data['event_type'][] = $term_name;
        }
      }
      foreach ($object->field_hobby_category as $term) {
        if ($term->target_id) {
          $term_name = Term::load($term->target_id)->get('name')->value;
          $data['hobby_category'][] = $term_name;
        }
      }
     

      // Text fields
      $data['description'] = $object->field_description->value;
      $data['short_description'] = $object->field_short_description->value;
      if ($object->hasField('field_tickets')) {
        $data['tickets'] = $object->field_tickets->value;
      }

      // boolean fields
      $data['free_enterance'] = $object->field_free_enterance->value;
      $data['is_hobby'] = $object->field_hobby_is_hobby->value;
      $data['accessible'] = $object->field_accessible->value;
      $data['child_care'] = $object->field_child_care->value;
      $data['culture_and_or_activity_no'] = $object->field_culture_and_or_activity_no->value;

      // Date fields
      $from = $object->field_start_time->value . ".000Z";
      $to = $object->field_end_time->value . ".000Z";

      $start_date = date('Y-m-d', strtotime($from));
      $end_date = date('Y-m-d', strtotime($to));
      $start_date == $end_date ? $data['single_day'] = 1 : $data['single_day'] = 0;

      $data['start_time'] = $from;
      $data['end_time'] = $to;

      $data['start_time_millis'] = date('U000', strtotime($from));
      $data['end_time_millis'] = date('U000',strtotime($to));

      $data['date_lenght'] = !empty($data['end_time_millis']) ? $data['end_time_millis'] - $data['start_time_millis'] : null;

      $data['date_pretty'] = date('j.n.Y H:i', strtotime($from)) . " - " . date('j.n.Y H:i', strtotime($to));



      // use image cache for external images
      if($object->field_image_ext_url->value) {
        try {
          $display_options = array(
            'type'     => 'imagecache_external_image',
          );
          $img_view = $object->get('field_image_ext_url')
            ->view($display_options);
          $img_cached = $img_view[0]['#uri'];
          $style = \Drupal::entityTypeManager()->getStorage('image_style')->load('list_image');
          $style_url = $style->buildUrl($img_cached);
          $data['image_ext'] = substr($style_url, strpos($style_url, "http://default/") + 15);
        } catch (\Exception $exception) {
          watchdog_exception('events2elastic', $exception, 'Failed setting external image on event.');
        }
      }
    }
    return $data;
  }

  /**
   * Get a list of translated term names.
   *
   * @param \Drupal\Core\Field\FieldItemList $terms
   *   List of Drupal terms.
   * @param string $langcode
   *   Language code.
   *
   * @return array
   *   List of translated term names.
   */
  private function getTranslatedTermNames(FieldItemList $terms, string $langcode) {
    $term_names = [];
    foreach ($terms as $term) {
      if ($term_entity = Term::load($term->target_id)) {
        $translated_term = \Drupal::service('entity.repository')->getTranslationFromContext($term_entity, $langcode);
        $term_names[] = $translated_term->getName();
      }
    }
    return $term_names;
  }

}
