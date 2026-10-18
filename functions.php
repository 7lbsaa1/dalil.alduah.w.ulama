<?php
// ==========================================
// File: functions.php
// Description: Headless WordPress Setup for Duat Platform (CPT + REST API + CORS)
// ==========================================

// 1. السماح لموقع Vercel بجلب البيانات (تفعيل CORS)
function add_cors_http_header() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('init', 'add_cors_http_header');


// 2. تسجيل قسم "الدعاة والعلماء" (Custom Post Type) في لوحة الأدمن
function register_duat_cpt() {
    $labels = array(
        'name'               => 'الدعاة والعلماء',
        'singular_name'      => 'داعية',
        'menu_name'          => 'دُعاة والشخصيات',
        'add_new'            => 'إضافة داعية جديد',
        'add_new_item'       => 'إضافة داعية جديد',
        'edit_item'          => 'تعديل بيانات الداعية',
        'new_item'           => 'داعية جديد',
        'view_item'          => 'عرض الداعية',
        'search_items'       => 'البحث عن داعية',
        'not_found'          => 'لم يتم العثور على دعاة',
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'has_archive'         => true,
        'show_in_rest'        => true, // تفعيل محرر جوتنبرج والـ REST API
        'rest_base'           => 'duat',
        'menu_icon'           => 'dashicons-groups',
        'supports'            => array('title', 'editor', 'thumbnail', 'excerpt', 'author'),
    );

    register_post_type('duat', $args);
}
add_action('init', 'register_duat_cpt');


// 3. إضافة مربع حقول التواصل الاجتماعي المخصصة في لوحة تحكم أدمن ووردبريس
function duat_add_social_meta_boxes() {
    add_meta_box(
        'duat_social_box',
        'روابط التواصل الاجتماعي الرسمية',
        'duat_social_meta_box_html',
        'duat',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'duat_add_social_meta_boxes');

function duat_social_meta_box_html($post) {
    $fb = get_post_meta($post->ID, '_facebook_url', true);
    $insta = get_post_meta($post->ID, '_instagram_url', true);
    $yt = get_post_meta($post->ID, '_youtube_url', true);
    ?>
    <div style="direction: rtl; padding: 10px;">
        <p>
            <label><b>رابط فيسبوك:</b></label><br>
            <input type="url" name="facebook_url" value="<?php echo esc_attr($fb); ?>" style="width:100%; margin-top:4px; padding:6px;">
        </p>
        <p>
            <label><b>رابط انستجرام:</b></label><br>
            <input type="url" name="instagram_url" value="<?php echo esc_attr($insta); ?>" style="width:100%; margin-top:4px; padding:6px;">
        </p>
        <p>
            <label><b>رابط يوتيوب:</b></label><br>
            <input type="url" name="youtube_url" value="<?php echo esc_attr($yt); ?>" style="width:100%; margin-top:4px; padding:6px;">
        </p>
    </div>
    <?php
}

// حفظ بيانات التواصل عند الحفظ في الأدمن
function duat_save_social_meta($post_id) {
    if (array_key_exists('facebook_url', $_POST)) {
        update_post_meta($post_id, '_facebook_url', sanitize_text_field($_POST['facebook_url']));
    }
    if (array_key_exists('instagram_url', $_POST)) {
        update_post_meta($post_id, '_instagram_url', sanitize_text_field($_POST['instagram_url']));
    }
    if (array_key_exists('youtube_url', $_POST)) {
        update_post_meta($post_id, '_youtube_url', sanitize_text_field($_POST['youtube_url']));
    }
}
add_action('save_post', 'duat_save_social_meta');


// 4. تجهيز وإظهار البيانات في الـ REST API (للشخصيات والمقالات)
function duat_register_api_fields() {
    // جلب روابط التواصل والصورة البارزة لـ قسم الدعاة
    register_rest_field('duat', 'custom_data', array(
        'get_callback' => function($post_arr) {
            $img_id = get_post_thumbnail_id($post_arr['id']);
            return array(
                'image'    => $img_id ? wp_get_attachment_image_url($img_id, 'full') : '',
                'socials'  => array(
                    'facebook'  => get_post_meta($post_arr['id'], '_facebook_url', true),
                    'instagram' => get_post_meta($post_arr['id'], '_instagram_url', true),
                    'youtube'   => get_post_meta($post_arr['id'], '_youtube_url', true),
                )
            );
        },
        'schema' => null,
    ));

    // جلب الصورة البارزة للمقالات العادية (Blog Posts)
    register_rest_field('post', 'featured_image_url', array(
        'get_callback' => function($post_arr) {
            $img_id = get_post_thumbnail_id($post_arr['id']);
            return $img_id ? wp_get_attachment_image_url($img_id, 'full') : '';
        },
        'schema' => null,
    ));
}
add_action('rest_api_init', 'duat_register_api_fields');
