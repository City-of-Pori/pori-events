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
  public function getMappingDefinition(array $context = []) {
    $date = FieldDefinition::create('date')
      ->addOption('format', 'epoch_second');

    return MappingDefinition::create()
      ->addProperty('id', FieldDefinition::create('integer'))
      ->addProperty('uuid', FieldDefinition::create('keyword'))
      ->addProperty('langcode', FieldDefinition::create('keyword'))
      ->addProperty('title', FieldDefinition::create('text'))
      ->addProperty('created', $date)
      ->addProperty('updated', $date)
      ->addProperty('status', FieldDefinition::create('boolean'))
      ->addProperty('area_sub_area', FieldDefinition::create('keyword'))
      ->addProperty('body', FieldDefinition::create('text'));
  }

  /**
   * {@inheritdoc}
   */
  public function getIndexDefinition(array $context = []) {
    // Get index definition.
    $index_definition = parent::getIndexDefinition($context);

    // Get analyzer for the language.
    $analyzer = ElasticsearchLanguageAnalyzer::get($context['langcode']);

    // Add custom settings.
    $index_definition->getSettingsDefinition()->addOptions([
      'analysis' => [
        'analyzer' => [
          $analyzer => [
            'tokenizer' => 'standard',
          ],
        ],
      ],
    ]);

    return $index_definition;
  }

}
