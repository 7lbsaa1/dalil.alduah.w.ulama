<?php
// ==========================================
// File: submit-person.php
// Description: API Endpoint to receive person submissions from Vercel Frontend
// ==========================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// تحميل إعدادات ووردبريس الأساسية
require_once('wp-load.php');

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['name'])) {
    // إنشاء المنشور بحالة draft (قيد المراجعة في الأدمن)
    $post_id = wp_insert_post(array(
        'post_title'   => sanitize_text_field($data['name']),
        'post_type'    => 'duat',
        'post_status'  => 'draft', // يبقى مسودة لحين موافقة الأدمن
    ));

    if ($post_id && !is_wp_error($post_id)) {
        // حفظ روابط التواصل الاجتماعي
        if (!empty($data['socials']['facebook'])) {
            update_post_meta($post_id, '_facebook_url', sanitize_text_field($data['socials']['facebook']));
        }
        if (!empty($data['socials']['instagram'])) {
            update_post_meta($post_id, '_instagram_url', sanitize_text_field($data['socials']['instagram']));
        }
        if (!empty($data['socials']['youtube'])) {
            update_post_meta($post_id, '_youtube_url', sanitize_text_field($data['socials']['youtube']));
        }

        echo json_encode(["success" => true, "message" => "تم استلام الطلب وبانتظار مراجعة الأدمن"]);
    } else {
        echo json_encode(["success" => false, "message" => "فشل حفظ البيانات"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "اسم الشخصية مطلوب"]);
}
