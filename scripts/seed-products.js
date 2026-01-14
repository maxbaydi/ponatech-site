const { config } = require('dotenv');
const { PrismaClient, ProductStatus } = require('@prisma/client');

config();

const prisma = new PrismaClient();

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const parsePrice = (priceStr) => {
  return parseFloat(priceStr.replace(',', '.'));
};

const products = [
  {
    title: 'Additional contact CA6-11N-F side',
    sku: 'GJL1201318R0004',
    stock: 1051,
    imageUrl: 'https://s3.iautomatica.ru/iblock/153/a5a003e7_40fd_11ea_8117_0cc47a73967f_8686a469_66fb_11ea_8119_0cc47a73967f.resize2.jpeg',
    brand: 'ABB',
    price: '4,3',
  },
  {
    title: 'Mini contactor BC7-40-00-P2.4-51',
    sku: 'GJL1313209R5001',
    stock: 4378,
    imageUrl: 'https://s3.iautomatica.ru/iblock/153/a5a003e7_40fd_11ea_8117_0cc47a73967f_8686a469_66fb_11ea_8119_0cc47a73967f.resize2.jpeg',
    brand: 'ABB',
    price: '18,1',
  },
  {
    title: 'Additional contact CA6-11M-F side',
    sku: 'GJL1201318R0003',
    stock: 1051,
    imageUrl: 'https://s3.iautomatica.ru/iblock/153/a5a003e7_40fd_11ea_8117_0cc47a73967f_8686a469_66fb_11ea_8119_0cc47a73967f.resize2.jpeg',
    brand: 'ABB',
    price: '4,3',
  },
  {
    title: 'Automatic switch S282UC-B32',
    sku: 'GHS2820164R0325',
    stock: 3,
    imageUrl: 'https://s3.iautomatica.ru/iblock/04c/2f60891e_c758_11e8_8109_0cc47a73967f_eb68d461_6473_11ea_8119_0cc47a73967f.resize2.jpeg',
    brand: 'ABB',
    price: '0,0',
  },
  {
    title: 'Additional contact CAF6-11N front mounting for mini contactors B6, B7',
    sku: 'GJL1201330R0004',
    stock: 769,
    imageUrl: 'https://s3.iautomatica.ru/iblock/153/a5a003e7_40fd_11ea_8117_0cc47a73967f_8686a469_66fb_11ea_8119_0cc47a73967f.resize2.jpeg',
    brand: 'ABB',
    price: '3,2',
  },
  {
    title: 'Mini contactor B6-40-00-P-03 (400V AC3) coil 48V AC',
    sku: 'GJL1211209R0003',
    stock: 3206,
    imageUrl: 'https://s3.iautomatica.ru/iblock/153/a5a003e7_40fd_11ea_8117_0cc47a73967f_8686a469_66fb_11ea_8119_0cc47a73967f.resize2.jpeg',
    brand: 'ABB',
    price: '13,2',
  },
  {
    title: 'Modular contactor ESB-63-30 (63A AC1) coil 400V AC/DC',
    sku: 'GHE3691502R0007',
    stock: 12885,
    imageUrl: 'https://s3.iautomatica.ru/iblock/153/a5a003e7_40fd_11ea_8117_0cc47a73967f_8686a469_66fb_11ea_8119_0cc47a73967f.resize2.jpeg',
    brand: 'ABB',
    price: '53,2',
  },
  {
    title: 'Modular contactor ESB-63-31 (63A AC1) coil 110V AC/DC',
    sku: 'GHE3691602R0004',
    stock: 12885,
    imageUrl: 'https://s3.iautomatica.ru/iblock/153/a5a003e7_40fd_11ea_8117_0cc47a73967f_8686a469_66fb_11ea_8119_0cc47a73967f.resize2.jpeg',
    brand: 'ABB',
    price: '53,2',
  },
  {
    title: 'Modular contactor ESB-63-31 (63A AC1) coil 230V AC/DC',
    sku: 'GHE3691602R0006',
    stock: 11553,
    imageUrl: 'https://s3.iautomatica.ru/iblock/153/a5a003e7_40fd_11ea_8117_0cc47a73967f_8686a469_66fb_11ea_8119_0cc47a73967f.resize2.jpeg',
    brand: 'ABB',
    price: '47,7',
  },
];

const run = async () => {
  try {
    const brand = await prisma.brand.upsert({
      where: { name: 'ABB' },
      create: {
        name: 'ABB',
        slug: 'abb',
      },
      update: {},
    });

    console.log('Brand:', brand.name, brand.id);

    let category = await prisma.category.findFirst({
      where: { slug: 'elektrotehnika' },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Электротехника',
          slug: 'elektrotehnika',
        },
      });
    }

    console.log('Category:', category.name, category.id);

    for (const productData of products) {
      const slug = slugify(productData.title);
      const price = parsePrice(productData.price);

      const existingProduct = await prisma.product.findUnique({
        where: { sku: productData.sku },
      });

      if (existingProduct) {
        console.log(`Product with SKU ${productData.sku} already exists, skipping...`);
        continue;
      }

      const product = await prisma.product.create({
        data: {
          title: productData.title,
          slug: slug,
          sku: productData.sku,
          price: price,
          currency: 'RUB',
          status: ProductStatus.PUBLISHED,
          stock: productData.stock,
          attributes: {},
          brandId: brand.id,
          categoryId: category.id,
          images: {
            create: {
              url: productData.imageUrl,
              alt: productData.title,
              order: 0,
              isMain: true,
            },
          },
        },
      });

      console.log(`Created product: ${product.title} (${product.sku})`);
    }

    console.log('All products added successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

run()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
