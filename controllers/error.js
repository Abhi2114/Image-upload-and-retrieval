exports.pageNotFound = (request, response, next) => {
    response.status(404).render('error', {pageTitle: 'Page not found', message: 'Oops, we couldn\'t find that page'})
}
