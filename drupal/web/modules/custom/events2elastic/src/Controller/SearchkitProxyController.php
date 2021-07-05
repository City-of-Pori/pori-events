<?php

namespace Drupal\events2elastic\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Language\LanguageManager;
use Elasticsearch\Client;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Class SearchkitProxyController.
 */
class SearchkitProxyController extends ControllerBase {

  /**
   * Request.
   *
   * @var null|\Symfony\Component\HttpFoundation\Request
   */
  protected $request;

  /**
   * Logger.
   *
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  protected $logger;

  /**
   * Language manager.
   *
   * @var \Drupal\Core\Language\LanguageManager
   */
  protected $languageManager;

  /**
   * Client.
   *
   * @var \Elasticsearch\Client
   */
  protected $client;

  /**
   * SearchkitProxyController constructor.
   */
  public function __construct(RequestStack $request_stack, LoggerChannelFactoryInterface $logger_channel_factory, LanguageManager $language_manager, Client $client) {
    $this->request = $request_stack->getCurrentRequest();
    $this->logger = $logger_channel_factory->get('events2elastic');
    $this->languageManager = $language_manager;
    $this->client = $client;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container): SearchkitProxyController {
    return new static(
      $container->get('request_stack'),
      $container->get('logger.factory'),
      $container->get('language_manager'),
      $container->get('elasticsearch_helper.elasticsearch_client')
    );
  }

  /**
   * Proxy.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   Return elasticsearch response.
   */
  public function proxy(): JsonResponse {
    try {
      $langcode = $this->languageManager->getCurrentLanguage()->getId();

      // We don't use Drupal\Component\Serialization\Json because it can't tell
      // the difference between an empty object and an empty array.
      $content = json_decode($this->request->getContent(), FALSE);

      $valid_query = $content->query->bool->must[0]->bool->should[0] ?? NULL;
      if ($valid_query) {
        // Get rid of multi_match in query
        unset($content->query->bool->must[0]->bool->should[1]);
      }

      $hits = $this->client->search([
        'index' => 'event-node-' . $langcode,
        'body' => $content,
      ]);

      // Following line is for Pagination fix (kada-elastic-events React app)
      $hits['hits']['total'] = $hits['hits']['total']['value'] ?? 0;
      return new JsonResponse($hits);
    } catch (\Exception $e) {
      $this->logger->info($e->getMessage());
      throw new BadRequestHttpException();
    }
  }

}
