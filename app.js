// ==========================================
// Example: Fetching Data from WordPress REST API in Frontend
// ==========================================

const WP_DOMAIN = "https://your-wordpress-site.com"; // رابط موقع ووردبريس الخاص بك

// 1. جلب قائمة الدعاة والشخصيات المقبولة
async function fetchDuatFromWP() {
  try {
    const response = await fetch(`${WP_DOMAIN}/wp-json/wp/v2/duat?status=publish`);
    const duatList = await response.json();

    console.log("قائمة الدعاة المنشورة من ووردبريس:", duatList);

    // مثال لربطها ببطاقات الموقع
    duatList.forEach(person => {
      const name = person.title.rendered;
      const image = person.custom_data.image;
      const socials = person.custom_data.socials;
      const bio = person.content.rendered; // السيرة الذاتية أو النص الطويل المنسق

      // عرض البيانات في الـ HTML...
    });
  } catch (error) {
    console.error("خطأ في جلب الشخصيات من ووردبريس:", error);
  }
}

// 2. جلب المقالات والأخبار الدينية (Rich Text & Blog Posts)
async function fetchArticlesFromWP() {
  try {
    const response = await fetch(`${WP_DOMAIN}/wp-json/wp/v2/posts?status=publish`);
    const posts = await response.json();

    console.log("المقالات والأخبار من ووردبريس:", posts);

    posts.forEach(article => {
      const title = article.title.rendered;
      const fullHTMLContent = article.content.rendered; // النص المنسق كاملاً مع الصور والجداول والاقتباسات من Gutenberg
      const featuredImage = article.featured_image_url;
      const date = new Date(article.date).toLocaleDateString('ar-EG');

      // عرض المقال في صفحة المقالات...
    });
  } catch (error) {
    console.error("خطأ في جلب المقالات:", error);
  }
}
