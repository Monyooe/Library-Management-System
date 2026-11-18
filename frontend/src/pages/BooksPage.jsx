
import { useState } from 'react';
import AddBookForm from '../components/AddBookForm';
import BookList from '../components/BookList';

function BooksPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    function refreshBooks() {
        setRefreshKey(previous => previous + 1);
    }

    return (
        <div className="page-content">
            <h1>Book Management</h1>
            <p>Add, update, view and delete library books.</p>

            <AddBookForm onBookAdded={refreshBooks} />

            <BookList refreshKey={refreshKey} />
        </div>
    );
}

export default BooksPage;
