<?php

namespace Drupal\pori_event_search_defaults\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Drupal\Core\Cache\CacheableRedirectResponse;
use Symfony\Component\HttpKernel\KernelEvents;
use Drupal\Core\Url;

/**
 * Class HobbiesRedirectSubscriber.
 */
class EventsDefaultRedirectSubscriber implements EventSubscriberInterface {

  /**
   * Add daterange query parameters for default calendar view requests.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   ResponseEvent.
   */
  public function dateRangeRedirect(RequestEvent $event) {

    $url = Url::fromRoute('<current>')->getInternalPath();

    /* @var $path_matcher \Drupal\Core\Path\PathMatcher */
    $path_matcher = \Drupal::service('path.matcher');

    $do_redirect = ($path_matcher->isFrontpage() || $path_matcher->matchPath('harrastukset', $url)) ? TRUE : FALSE;

    if (empty(\Drupal::request()->query->all()) && $do_redirect) {
      global $base_url;
      $today = strtotime('today midnight');

      // Use millisecond dates like
      // \Drupal\events2elastic\Plugin\Normalizer\NodeNormalizer does..
      $start = 'event_date_from=' . date('U000', $today);
      $end = 'event_date_to=' . date('U000', strtotime('+6 day', $today));

      // Rewrite to empty url if homepage.
      $url = ($path_matcher->isFrontpage()) ? '' : $url;

      $event->setResponse(new CacheableRedirectResponse($base_url . '/' . $url . '?' . $start . '&' . $end));
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::REQUEST][] = ['dateRangeRedirect', 30];

    return $events;
  }

}
