<?php

namespace Drupal\events2elastic\Plugin\ElasticsearchIndex;

use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\elasticsearch_helper\Elasticsearch\Index\FieldDefinition;
use Drupal\elasticsearch_helper\Elasticsearch\Index\MappingDefinition;
use Drupal\elasticsearch_helper\ElasticsearchLanguageAnalyzer;
use Drupal\elasticsearch_helper\Event\ElasticsearchOperations;
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
 *   bundle = "event",
 *   normalizerFormat = "content_node"
 * )
 */
class EventIndex extends ElasticsearchIndexBase {

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
    try {
      // Create one index per language, so that we can have different analyzers.
      foreach ($this->languageManager->getLanguages() as $langcode => $language) {
        // Get index name.
        $index_name = $this->getIndexName(['langcode' => $langcode]);

        // Check if index exists.
        if (!$this->client->indices()->exists(['index' => $index_name])) {
          // Get index definition.
          $index_definition = $this->getIndexDefinition(['langcode' => $langcode]);

          $this->createIndex($index_name, $index_definition);
        }
      }
    } catch (\Throwable $e) {
      $this->dispatchOperationErrorEvent($e, ElasticsearchOperations::INDEX_CREATE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getMappingDefinition(array $context = []) {
    // Get analyzer for the language.
    $analyzer = ElasticsearchLanguageAnalyzer::get($context['langcode']);

    // Set field definitions.
    $keyword = FieldDefinition::create('keyword');
    $boolean = FieldDefinition::create('boolean');
    $text = FieldDefinition::create('text')->addOption('store', TRUE);
    $date = FieldDefinition::create('date');

    $date_formatted = FieldDefinition::create('date')
      ->addOption('format', 'epoch_second');
    $text_analyzed = FieldDefinition::create('text')
      ->addOption('store', TRUE)
      ->addOption('analyzer', $analyzer);

    return MappingDefinition::create()
      ->addProperty('langcode', $keyword)
      ->addProperty('id', FieldDefinition::create('integer'))
      ->addProperty('uuid', $keyword)
      ->addProperty('service_id', $keyword)
      ->addProperty('bundle', $keyword)
      ->addProperty('type', $keyword)
      ->addProperty('created', $date_formatted)
      ->addProperty('updated', $date_formatted)
      ->addProperty('status', $boolean)
      ->addProperty('title', $text_analyzed
        ->addMultiField('autocomplete', FieldDefinition::create('text')
          ->addOption('analyzer', 'autocomplete')
          ->addOption('search_analyzer', 'simple')
          ->addOption('store', TRUE))
        ->addMultiField('stemmed', FieldDefinition::create('text'))
        ->addOption('analyzer', $analyzer)
        ->addOption('store', TRUE)
        ->addMultiField('raw', FieldDefinition::create('keyword')
          // Use case-insensitivity.
          ->addOption('normalizer', 'case_insensitive')
        ))
      ->addProperty('area', $keyword)
      ->addProperty('area_sub_area', $keyword)
      ->addProperty('target_audience', $keyword)
      ->addProperty('event_type', $keyword)
      ->addProperty('tickets', $text_analyzed)
      ->addProperty('free_enterance', $boolean)
      ->addProperty('description', $text_analyzed
        ->addMultiField('raw', FieldDefinition::create('keyword')
          // Use case-insensitivity.
          ->addOption('normalizer', 'case_insensitive')
        ))
      ->addProperty('short_description', $text_analyzed
        ->addMultiField('raw', FieldDefinition::create('keyword')
          // Use case-insensitivity.
          ->addOption('normalizer', 'case_insensitive')
        ))
      ->addProperty('image', $text
        ->addOption('index', FALSE))
      ->addProperty('start_time', $date)
      ->addProperty('start_date', $date_formatted)
      ->addProperty('start_date_millis', $date)
      ->addProperty('end_date', $date_formatted)
      ->addProperty('end_date_millis', $date)
      ->addProperty('date_lenght', $text)
      ->addProperty('date_pretty', $text)
      ->addProperty('single_day', $boolean)
      ->addProperty('is_hobby', $boolean)
      ->addProperty('accessible', $boolean)
      ->addProperty('child_care', $boolean)
      ->addProperty('culture_and_or_activity_no', $boolean)
      ->addProperty('hobby_category', $keyword)
      ->addProperty('hobby_sub_category', $keyword)
      ->addProperty('hobby_audience', $keyword)
      ->addProperty('hobby_location_area', $keyword)
      ->addProperty('hobby_location_sub_area', $keyword)
      ->addProperty('registration', $boolean)
      ->addProperty('timeframe', $keyword)
      ->addProperty('monday', $boolean)
      ->addProperty('tuesday', $boolean)
      ->addProperty('wednesday', $boolean)
      ->addProperty('thursday', $boolean)
      ->addProperty('friday', $boolean)
      ->addProperty('saturday', $boolean)
      ->addProperty('sunday', $boolean);
  }

  /**
   * {@inheritdoc}
   */
  public function getIndexDefinition(array $context = []) {
    // Get index definition.
    $index_definition = parent::getIndexDefinition($context);

    // Get analyzer for the language.
    $analyzer = ElasticsearchLanguageAnalyzer::get($context['langcode']);

    // Add custom settings for index.
    $index_definition->getSettingsDefinition()->addOptions([
      'max_ngram_diff' => 16,
      // Use a single shard to improve relevance on a small dataset.
      'number_of_shards' => 1,
      // No need for replicas, we only have one ES node.
      'number_of_replicas' => 0,
      'analysis' => [
        // Set up case-insensitivity.
        'normalizer' => ['case_insensitive' => ['filter' => ['lowercase']]],
        'filter' => [
          'autocomplete_filter' => [
            'type' => 'edge_ngram',
            'min_gram' => 4,
            'max_gram' => 20,
            "char_filter" => ["html_strip"],
            'token_chars' => ['letter'],
          ],
          'pori_nGram' => [
            'type' => 'nGram',
            'min_gram' => 3,
            'max_gram' => 15,
          ],
        ],
        'analyzer' => [
          $analyzer => ['tokenizer' => 'standard'],
          'comma_separated' => [
            'type' => 'custom',
            'tokenizer' => 'custom_comma_tokenizer',
          ],
          'autocomplete' => [
            'type' => 'custom',
            'tokenizer' => 'standard',
            'filter' => ['lowercase', 'autocomplete_filter', 'pori_nGram'],
          ],
          'keyword_autocomplete' => [
            'type' => 'custom',
            'tokenizer' => 'keyword',
            'filter' => ['lowercase', 'autocomplete_filter', 'pori_nGram'],
          ],
        ],
        'tokenizer' => [
          'custom_comma_tokenizer' => [
            'type' => 'pattern',
            'pattern' => ',',
            'filter' => ['lowercase', 'autocomplete_filter', 'pori_nGram'],
          ],
        ],
      ],
    ]);
    $index_definition->setType('node');
    return $index_definition;
  }

}
