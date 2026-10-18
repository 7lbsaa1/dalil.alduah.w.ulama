<?php
// ==========================================
// File: functions.php
// Description: Headless WordPress Backend Config for "Duat" Platform
// ==========================================

// 1. تسجيل Custom Post Type للشخصيات والدعاة داخل لوحة الأدمن
function register_duat_post_type() {
    $labels = array(
        'name'               => 'الدعاة والعلماء',
        'singular_name'      => 'داعية',
        'menu_name'          => 'دُعاة',
        'add_new'            => 'إضافة داعية جديد',
        'add_new_item'       => 'إضافة داعية جديد',
        'edit_item'          => 'تعديل بيانات الداعية',
        'new_item'           => 'داعية جديد',
        'view_item'          => 'عرض الداعية',
        'search_items'       => 'البحث عن داعية',
        'not_found'          => 'لم يتم العثور على دعاة',
        'not_found_in_trash' => 'سلة المهملات فارغة'
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'has_archive'         => false,
        'publicly_queryable'  => true,
        'show_in_rest'        => true, // تفعيل التوفر عبر REST API لموقع Vercel
        'rest_base'           => 'duat',
        'capability_type'     => 'post',
        'menu_icon'           => 'dashicons-groups',
        'supports'            => array('title', 'editor', 'thumbnail'),
    );

    register_post_type('duat', $args);
}
add_action('init', 'register_duat_post_type');


// 2. إضافة حقول روابط التواصل الاجتماعي في لوحة الأدمن
function duat_add_social_metabox() {
    add_meta_box(
        'duat_social_links',
        'روابط التواصل الاجتماعي الرسمية',
        'duat_social_metabox_html',
        'duat',
        'normal',
        'default'
    );
}
add_action('add_meta_boxes', 'duat_add_social_metabox');

function duat_social_metabox_html($post) {
    $fb = get_post_meta($post->ID, '_facebook_url', true);
    $insta = get_post_meta($post->ID, '_instagram_url', true);
    $yt = get_post_meta($post->ID, '_youtube_url', true);
    ?>
    <div style="direction: rtl; padding: 10px;">
        <p>
            <label><b>رابط فيسبوك:</b></label><br>
            <input type="url" name="facebook_url" value="<?php echo esc_attr($fb); ?>" style="width:100%; margin-top:5px;">
        </p>
        <p>
            <label><b>رابط انستجرام:</b></label><br>
            <input type="url" name="instagram_url" value="<?php echo esc_attr($insta); ?>" style="width:100%; margin-top:5px;">
        </p>
        <p>
            <label><b>رابط يوتيوب:</b></label><br>
            <input type="url" name="youtube_url" value="<?php echo esc_attr($yt); ?>" style="width:100%; margin-top:5px;">
        </p>
    </div>
    <?php
}

// 3. حفظ بيانات التواصل عند الضغط على "نشر/تحديث" في الأدمن
function duat_save_social_data($post_id) {
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
add_action('save_post', 'duat_save_social_data');


// 4. تجهيز وإخراج حقول التواصل الاجتماعي والصورة المرفوعة لـ REST API
function duat_register_api_fields() {
    register_rest_field('duat', 'socials', array(
        'get_callback' => function($post_arr) {
            return array(
                'facebook'  => get_post_meta($post_arr['id'], '_facebook_url', true),
                'instagram' => get_post_meta($post_arr['id'], '_instagram_url', true),
                'youtube'   => get_post_meta($post_arr['id'], '_youtube_url', true),
            );
        },
        'schema' => null,
    ));

    register_rest_field('duat', 'image_url', array(
        'get_callback' => function($post_arr) {
            $img_id = get_post_thumbnail_id($post_arr['id']);
            return $img_id ? wp_get_attachment_image_url($img_id, 'full') : '';
        },
        'schema' => null,
    ));
}
add_action('rest_api_init', 'duat_register_api_fields');
