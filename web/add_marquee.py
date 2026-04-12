content = open('C:/Users/Skilli/Desktop/island_fund/web/src/app/listings/page.tsx', 'r', encoding='utf-8').read()
content = content.replace(
    '<FloatingBanner location="marketplace" />',
    '<FloatingBanner location="marketplace" />\n\n                            <BrandMarquee type="product" />'
)
open('C:/Users/Skilli/Desktop/island_fund/web/src/app/listings/page.tsx', 'w', encoding='utf-8').write(content)
print('Done')
