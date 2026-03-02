import re

# Read the file
with open('C:/Users/Skilli/Desktop/island_fund/web/src/app/listings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add BrandMarquee import
content = content.replace(
    "import FloatingBanner from '@/components/FloatingBanner';",
    "import FloatingBanner from '@/components/FloatingBanner';\nimport BrandMarquee from '@/components/BrandMarquee';"
)

# Add product marquee after CategorySection
old_text = '<CategorySection />'
new_text = '''<CategorySection />
        
        {/* Product Marquee - Trending Products */}
        <BrandMarquee type="product" />'''

content = content.replace(old_text, new_text)

# Write the file
with open('C:/Users/Skilli/Desktop/island_fund/web/src/app/listings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
