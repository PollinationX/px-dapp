import useTranslation from 'next-translate/useTranslation'

const FourOhFour = () => {
  const { t } = useTranslation()

  return (
    <>
      <section className='bg-neutral-200 dark:bg-neutral-700 h-screen'>
        <div className='py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6'>
          <div className='mx-auto max-w-screen-sm text-center'>
            <h1 className='mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-pollinationx-honey dark:text-pollinationx-honey'>404</h1>
            <p className='mb-4 text-3xl tracking-tight font-bold text-pollinationx-grey md:text-4xl dark:text-white'>{t('notFound')}</p>
            <p className='mb-4 text-lg font-light text-pollinationx-grey dark:text-pollinationx-grey'>{t('pageNotFound')}</p>
            <a
              href='/'
              className='relative inline-flex items-center justify-center p-0.5 mb-2 mr-2
                        overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                        from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                        hover:text-white dark:text-white focus:ring-0 focus:outline-none focus:ring-0
                        dark:focus:ring-blue-800'
            >
              <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 uppercase'>
                {t('toHomepage')}
              </span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default FourOhFour
