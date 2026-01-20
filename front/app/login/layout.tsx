import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/">
            <Image
              src="/assets/ponatech-logo-rectangular.webp"
              alt="Pona Tech"
              width={160}
              height={46}
              className="h-12 w-auto brightness-0 invert"
            />
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Добро пожаловать в PONA TECH
            </h1>
            <p className="text-white/80 text-lg max-w-md">
              Международные поставки промышленного и ИТ-оборудования от 70+ мировых брендов с 
              полным контролем качества и оптимальными сроками.
            </p>
          </div>
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} PONA TECH. Все права защищены.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex justify-center mb-8">
            <Image
              src="/assets/ponatech-logo-rectangular.webp"
              alt="Pona Tech"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
