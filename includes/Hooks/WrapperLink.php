<?php

namespace Blockish\Hooks;

defined('ABSPATH') || exit;

class WrapperLink
{
    use \Blockish\Traits\SingletonTrait;

    /**
     * Constructor.
     */
    protected function __construct()
    {
        add_filter('render_block', [$this, 'render_block'], 20, 2);
    }

    /**
     * Wrap rendered block markup with anchor when wrapperLink url is set.
     *
     * @param string $block_content Rendered block HTML.
     * @param array  $block Parsed block data.
     * @return string
     */
    public function render_block($block_content, $block)
    {
        if (empty($block_content) || empty($block['attrs']['wrapperLink']['url'])) {
            return $block_content;
        }

        $url = esc_url($block['attrs']['wrapperLink']['url']);
        if (empty($url)) {
            return $block_content;
        }

        $attributes = [
            'href' => $url,
            'class' => 'blockish-wrapper-link-anchor',
        ];

        $link = $block['attrs']['wrapperLink'];
        if (!empty($link['newTab'])) {
            $attributes['target'] = '_blank';
            $attributes['rel'] = 'noopener';
        }

        if (!empty($link['noFollow'])) {
            $attributes['rel'] = isset($attributes['rel'])
                ? trim($attributes['rel'] . ' nofollow')
                : 'nofollow';
        }

        $html_attributes = '';
        foreach ($attributes as $key => $value) {
            $html_attributes .= sprintf(' %s="%s"', esc_attr($key), esc_attr($value));
        }

        return sprintf('<a%s>%s</a>', $html_attributes, $block_content);
    }
}

