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
   * {@inheritdoc}
   */
  protected $supportedInterfaceOrClass = [Node::class];

  /**
   * {@inheritdoc}
   */
  protected $format = 'content_node';

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
      'url' => $object->toUrl()->toString(),
    ];

    if ($bundle == 'event') {

      // Term fields
      $data['type'] = 'node';
      $data['area'] = $this->getTranslatedParentTermNames($object->field_area, $langcode);
      $data['area_sub_area'] = $this->getTranslatedChildTermNames($object->field_area, $langcode);
      $data['hobby_area'] = $this->getTranslatedTermNames($object->field_hobby_area, $langcode);
      $data['target_audience'] = $this->getTranslatedTermNames($object->field_target_audience, $langcode);
      $data['hobby_audience'] = $this->getTranslatedTermNames($object->field_hobby_audience, $langcode);
      $data['event_type'] = $this->getTranslatedTermNames($object->field_event_type, $langcode);
      $data['hobby_category'] = $this->getTranslatedParentTermNames($object->field_hobby_category, $langcode);
      $data['hobby_sub_category'] = $this->getTranslatedChildTermNames($object->field_hobby_category, $langcode);
      $data['hobby_location_area'] = $this->getTranslatedParentTermNames($object->field_hobby_area, $langcode);
      $data['hobby_location_sub_area'] = $this->getTranslatedChildTermNames($object->field_hobby_area, $langcode);

      // Text fields
      $data['description'] = $object->field_description->value;
      $data['short_description'] = $object->field_short_description->value;
      if ($object->hasField('field_tickets')) {
        $data['tickets'] = $object->field_tickets->value;
      }

      $data['monday'] = isset($object->field_weekday_monday->value);
      $data['tuesday'] = isset($object->field_weekday_tuesday->value);
      $data['wednesday'] = isset($object->field_weekday_wednesday->value);
      $data['thursday'] = isset($object->field_weekday_thursday->value);
      $data['friday'] = isset($object->field_weekday_friday->value);
      $data['saturday'] = isset($object->field_weekday_saturday->value);
      $data['sunday'] = isset($object->field_weekday_sunday->value);

      // Timeframe
      // $data['timeframe'] = $object->field_timeframe_of_day->value;
      $timefields = $object->field_timeframe_of_day->value;
      if ($timefields == "0") {
        $data['timeframe'] = " Aamupäivällä";
      }
      elseif ($timefields == "1") {
        $data['timeframe'] = "Iltapäivällä";
      }
      else {
        $data['timeframe'] = "Illalla";
      }


      // boolean fields
      $data['free_enterance'] = $object->field_free_enterance->value == TRUE;
      $data['is_hobby'] = $object->field_hobby_is_hobby->value == TRUE;
      $data['accessible'] = $object->field_accessible->value == TRUE;
      $data['child_care'] = $object->field_child_care->value == TRUE;
      $data['super_event'] = $object->field_super_event->value == TRUE;
      $data['culture_and_or_activity_no'] = $object->field_culture_and_or_activity_no->value == TRUE;
      $data['registration'] = $object->field_pre_registration->value == TRUE;

      // This should make status unpublished.
      if (!empty($object->field_super_event->value) && $object->field_super_event->value == TRUE) {
        $data['status'] = 0;
      }

      // Date fields
      if (!empty($object->field_start_time->value)) {
        $from = $object->field_start_time->value . ".000Z";

        $start_date = date('Y-m-d', strtotime($from));

        $data['start_time'] = $from;

        $data['start_time_millis'] = date('U000', strtotime($from));
      }
      else {
        $data['start_time'] = NULL;
        $data['start_time_millis'] = NULL;
        $start_date = NULL;
      }
      if (!empty($object->field_end_time->value)) {
        $to = $object->field_end_time->value . ".000Z";

        $end_date = date('Y-m-d', strtotime($to));

        $data['end_time'] = $to;

        $data['end_time_millis'] = date('U000', strtotime($to));

        $data['date_lenght'] = !empty($data['end_time_millis']) ? $data['end_time_millis'] - $data['start_time_millis'] : NULL;

        $data['date_pretty'] = date('j.n.Y H:i', strtotime($from)) . " - " . date('j.n.Y H:i', strtotime($to));
      }
      else {
        // Set pretty date without dash and end date values to null.
        if ($start_date != NULL) {
          $data['date_pretty'] = date('j.n.Y H:i', strtotime($from));
        }
        else {
          $data['date_pretty'] = t('No dates given.');
        }
        $data['date_lenght'] = NULL;
        $data['end_time_millis'] = NULL;
        $data['end_time'] = NULL;
        $end_date = NULL;
      }

      $data['single_day'] = $start_date == $end_date;


      // use image cache for external images
      if ($object->field_image_ext_url->value) {
        try {
          $display_options = [
            'type' => 'imagecache_external_image',
          ];
          $img_view = $object->get('field_image_ext_url')
            ->view($display_options);
          $img_cached = $img_view[0]['#uri'];
          $style = \Drupal::entityTypeManager()
            ->getStorage('image_style')
            ->load('list_image');
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
   * Get a complete list of translated term names without hierarchy.
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
        $translated_term = \Drupal::service('entity.repository')
          ->getTranslationFromContext($term_entity, $langcode);
        $term_names[] = $translated_term->getName();
      }
    }
    return $term_names;
  }

  /**
   * Get a list of translated parent term names.
   *
   * @param \Drupal\Core\Field\FieldItemList $terms
   *   List of Drupal terms.
   * @param string $langcode
   *   Language code.
   *
   * @return array
   *   List of translated term names.
   */
  private function getTranslatedParentTermNames(FieldItemList $terms, string $langcode) {
    $term_names = [];
    foreach ($terms as $term) {
      if ($term_entity = Term::load($term->target_id)) {
        $translated_term = \Drupal::service('entity.repository')
          ->getTranslationFromContext($term_entity, $langcode);
        /** @var \Drupal\taxonomy\Entity\Term $translated_term */
        $parents = \Drupal::service('entity_type.manager')
          ->getStorage("taxonomy_term")
          ->loadParents($translated_term->id());
        if ($parents) {
          foreach ($parents as $parent) {
            /** @var \Drupal\taxonomy\Entity\Term $parent */
            if ($parent && $parent->label()) {
              $term_names[] = $parent->label();
            }
          }
        }
        else {
          $term_names[] = $translated_term->label();
        }
      }
    }

    // Drop duplicates and reset keys.
    $term_names = array_unique($term_names);
    $term_names = array_values($term_names);

    return $term_names;
  }

  /**
   * Get a list of translated child term names.
   *
   * @param \Drupal\Core\Field\FieldItemList $terms
   *   List of Drupal terms.
   * @param string $langcode
   *   Language code.
   *
   * @return array
   *   List of translated term names.
   */
  private function getTranslatedChildTermNames(FieldItemList $terms, string $langcode) {
    $term_names = [];
    foreach ($terms as $term) {
      if ($term_entity = Term::load($term->target_id)) {
        $translated_term = \Drupal::service('entity.repository')
          ->getTranslationFromContext($term_entity, $langcode);
        /** @var \Drupal\taxonomy\Entity\Term $translated_term */
        $parents = \Drupal::service('entity_type.manager')
          ->getStorage("taxonomy_term")
          ->loadParents($translated_term->id());
        if ($parents) {
          $term_names[] = $translated_term->label();
        }
      }
    }
    return $term_names;
  }

}
