import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {ApolloClient, HttpLink, InMemoryCache, ApolloProvider, ApolloLink} from '@apollo/client'
import {onError} from "@apollo/client/link/error";

const errorLink = onError(({graphQLErrors}) => {
    if (graphQLErrors) graphQLErrors.map(({message}) => console.log(message))
})


const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, new HttpLink({
        uri: 'http://localhost:4000',
    })])
})

ReactDOM.render(
    <ApolloProvider client={client}>
        <App/>
    </ApolloProvider>
    , document.getElementById('root'))