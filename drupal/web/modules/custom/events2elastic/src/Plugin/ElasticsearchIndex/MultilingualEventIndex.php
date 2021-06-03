<?php

namespace Drupal\events2elastic\Plugin\ElasticsearchIndex;

use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\elasticsearch_helper\Elasticsearch\Index\FieldDefinition;
use Drupal\elasticsearch_helper\Elasticsearch\Index\MappingDefinition;
use Drupal\elasticsearch_helper\ElasticsearchLanguageAnalyzer;
use Drupal\elasticsearch_helper\Plugin\ElasticsearchIndexBase;
use Elasticsearch\Client;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Serializer\Serializer;

/**
 * Sets up an Elasticsearch index for Services.
 *
 * @ElasticsearchIndex(
 *   id = "event_index",
 *   label = @Translation("Event Index"),
 *   indexName = "event-node-{langcode}",
 *   typeName = "node",
 *   entityType = "node",
 *   bundle = "event"
 * )
 */
class MultilingualEventIndex extends ElasticsearchIndexBase {
  /**
   * Language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, Client $client, Serializer $serializer, LoggerInterface $logger, LanguageManagerInterface $languageManager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $client, $serializer, $logger);
    $this->languageManager = $languageManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('elasticsearch_helper.elasticsearch_client'),
      $container->get('serializer'),
      $container->get('logger.factory')->get('elasticsearch_helper'),
      $container->get('language_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function serialize($source, $context = []) {
    /** @var \Drupal\node\Entity\Node $source */
    $data = parent::serialize($source, $context);
    // Add the language code to be used as a token.
    $data['langcode'] = $source->language()->getId();
    return $data;
  }

  /**
   * {@inheritdoc}
   */
  public function index($source) {
    /** @var \Drupal\node\Entity\Node $source */
    foreach ($source->getTranslationLanguages() as $langcode => $language) {
      if ($source->hasTranslation($langcode)) {
        parent::index($source->getTranslation($langcode));
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function delete($source) {
    /** @var \Drupal\node\Entity\Node $source */
    foreach ($source->getTranslationLanguages() as $langcode => $language) {
      if ($source->hasTranslation($langcode)) {
        parent::delete($source->getTranslation($langcode));
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function setup() {
    $languages = $this->languageManager->getLanguages();
    // Add an "undefined" language so that content is indexed properly.
    $languages['und'] = 'Language undefined';
    // Create one index per language, so that we can have different analyzers.
    foreach ($languages as $langcode => $language) {
      if (!$this->client->indices()->exists(['index' => 'event-node-' . $langcode])) {
        $this->client->indices()->create([
          'index' => 'event-node-' . $langcode,
          'body' => [
            // Use a single shard to improve relevance on a small dataset.
            'number_of_shards' => 1,
            // No need for replicas, we only have one ES node.
            'number_of_replicas' => 0,
            'analysis' => [
              'filter' => [
                'autocomplete_filter' => [
                  'type' => 'ngram',
                  'min_gram' => 4,
                  'max_gram' => 20,
                  'token_chars' => [
                    'letter',
                  ],
                ],
              ],
              'analyzer' => [
                'comma_separated' => [
                  'type' => 'custom',
                  'tokenizer' => 'custom_comma_tokenizer',
                ],
                'autocomplete' => [
                  'type' => 'custom',
                  'tokenizer' => 'standard',
                  'filter' => [
                    'lowercase',
                    'autocomplete_filter',
                  ],
                ],
                'keyword_autocomplete' => [
                  'type' => 'custom',
                  'tokenizer' => 'keyword',
                  'filter' => [
                    'lowercase',
                    'autocomplete_filter',
                  ],
                ],
              ],
              'tokenizer' => [
                'custom_comma_tokenizer' => [
                  'type' => 'pattern',
                  'pattern' => ',',
                ],
              ],
            ],
          ],
        ]);
        $analyzer = ElasticsearchLanguageAnalyzer::get($langcode);
        $mapping = [
          'index' => 'event-node-' . $langcode,
          'type' => 'node',
          'body' => [
            'properties' => [
              'id' => ['type' => 'integer'],
              'uuid' => ['type' => 'keyword'],
              'service_id' => ['type' => 'keyword'],
              'bundle' => [
                'type' => 'keyword',
              ],
              'created' => [
                'type' => 'date',
                'format' => 'epoch_second',
              ],
              'status' => [
                'type' => 'boolean',
              ],
              'title' => [
                'type' => 'text',
                'analyzer' => $analyzer,
                'fields' => [
                  'stemmed' => [
                    'type' => 'text',
                    'analyzer' => $analyzer,
                  ],
                  'autocomplete' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete',
                    'search_analyzer' => 'simple',
                  ],
                ],
              ],
              'area' => [
                'type' => 'keyword',
                'index' => 'analyzed',
              ],
              'area_sub_area' => [
                'type' => 'keyword',
                'index' => 'analyzed',
              ],
              'target_audience' => [
                'type' => 'keyword',
                'index' => 'analyzed',
              ],
              'event_type' => [
                'type' => 'keyword',
                'index' => 'analyzed',
              ],
              'tickets' => [
                'type' => 'text',
                'analyzer' => $analyzer,
              ],
              'free_enterance' => [
                'type' => 'boolean',
              ],
              'description' => [
                'type' => 'text',
                'analyzer' => $analyzer,
              ],
              'short_description' => [
                'type' => 'text',
                'analyzer' => $analyzer,
              ],
              'image' => [
                'type' => 'text',
                'index' => 'not_analyzed',
              ],
              'start_date' => [
                'type' => 'date',
                'format' => 'epoch_second',
              ],
              'start_date_millis' => [
                'type' => 'date',
              ],
              'end_date' => [
                'type' => 'date',
                'format' => 'epoch_second',
              ],
              'end_date_millis' => [
                'type' => 'date',
              ],
              'date_lenght' => [
                'type' => 'text',
              ],
              'date_pretty' => [
                'type' => 'text',
              ],
              'single_day' => [
                'type' => 'boolean',
              ],
              'is_hobby' => [
                'type' => 'boolean',
              ],
              'accessible' => [
                'type' => 'boolean',
              ],
              'child_care' => [
                'type' => 'boolean',
              ],
              'culture_and_or_activity_no' => [
                'type' => 'boolean',
              ],
              'hobby_category' => [
                'type' => 'keyword',
                'index' => 'analyzed',
              ],
              'hobby_sub_category' => [
                'type' => 'keyword',
                'index' => 'analyzed',
              ],
              'hobby_audience' => [
                'type' => 'keyword',
                'index' => 'analyzed',
              ],
              'hobby_location_area' => [
                'type' => 'keyword',
                'index' => 'analyzed',
              ],
              'hobby_location_sub_area' => [
                'type' => 'keyword',
                'index' => 'analyzed',
              ],
              'registration' => [
                'type' => 'boolean',
              ],
              'timeframe' => [
                'type' => 'keyword',
              ],
              'monday' => [
                'type' => 'boolean',
              ],
              'wednesday' => [
                'type' => 'boolean',
              ],
              'thursday' => [
                'type' => 'boolean',
              ],
              'friday' => [
                'type' => 'boolean',
              ],
              'saturday' => [
                'type' => 'boolean',
              ],
              'sunday' => [
                'type' => 'boolean',
              ],
            ],
          ],
        ];
        $this->client->indices()->putMapping($mapping);
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getMappingDefinition(array $context = []) {
    // Define only one field. Other fields will be created dynamically.
    return MappingDefinition::create()
      ->addProperty('title', FieldDefinition::create('text'));
  }

}
