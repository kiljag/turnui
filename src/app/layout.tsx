import './globals.css'

export const metadata = {
  title: 'Turn Games',
  description: 'Multiplayer Turn based games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='bg-gray-800'>
        {children}
      </body>
    </html>
  )
}
