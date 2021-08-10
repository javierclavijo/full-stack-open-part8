import React, {useState} from 'react'
import {useMutation} from "@apollo/client";
import {ADD_BOOK, ALL_AUTHORS, ALL_BOOKS} from "../queries";

const NewBook = (props) => {
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [published, setPublished] = useState('')
    const [genre, setGenre] = useState('')
    const [genres, setGenres] = useState([])
    const [notification, setNotification] = useState('')

    const [addBook] = useMutation(ADD_BOOK, {
        refetchQueries: [{query: ALL_BOOKS}, {query: ALL_AUTHORS}],
        onError: (e) => {
            const errorMessage = e.graphQLErrors[0] ? e.graphQLErrors[0] : e.message
            setNotification(errorMessage)
            setTimeout(() => setNotification(''), 5000)
        }
    })

    if (!props.show) {
        return null
    }

    const submit = async (event) => {
        event.preventDefault()

        await addBook({
            variables: {title, published: Number(published), author, genres}
        })

        setTitle('')
        setPublished('')
        setAuthor('')
        setGenres([])
        setGenre('')
    }

    const addGenre = () => {
        setGenres(genres.concat(genre))
        setGenre('')
    }

    return (
        <div>
            {notification
                ? <div style={{color: "red"}}>{notification}</div>
                : null
            }
            <form onSubmit={submit}>
                <div>
                    title
                    <input
                        value={title}
                        onChange={({target}) => setTitle(target.value)}
                        required
                    />
                </div>
                <div>
                    author
                    <input
                        value={author}
                        onChange={({target}) => setAuthor(target.value)}
                        required
                    />
                </div>
                <div>
                    published
                    <input
                        type='number'
                        value={published}
                        onChange={({target}) => setPublished(target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        value={genre}
                        onChange={({target}) => setGenre(target.value)}
                    />
                    <button onClick={addGenre} type="button">add genre</button>
                </div>
                <div>
                    genres: {genres.join(' ')}
                </div>
                <button type='submit'>create book</button>
            </form>
        </div>
    )
}

export default NewBook