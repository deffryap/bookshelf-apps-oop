class Book {
  // Penerapan constructor
  constructor(id, title, author, year, status) {
    this._id = id;
    this._title = title;
    this._author = author;
    this._year = year;
    this._status = status;
  }

  // Penerapan enkapsulasi
  get id() {
    return this._id;
  }

  get title() {
    return this._title;
  }

  set title(newTitle) {
    this._title = newTitle;
  }

  get author() {
    return this._author;
  }

  set author(newAuthor) {
    this._author = newAuthor;
  }

  get year() {
    return this._year;
  }

  set year(newYear) {
    this._year = newYear;
  }

  get status() {
    return this._status;
  }

  set status(newStatus) {
    this._status = newStatus;
  }

  toJSON() {
    return {
      id: this._id,
      title: this._title,
      author: this._author,
      year: this._year,
      status: this._status
    };
  }

  static fromJSON(json) {
    return new Book(json.id, json.title, json.author, json.year, json.status);
  }
}

// Penerapan inheritance
class EBook extends Book {
  constructor(id, title, author, year, status, format) {
    super(id, title, author, year, status);
    this._format = format;
  }

  get format() {
    return this._format;
  }

  set format(newFormat) {
    this._format = newFormat;
  }
}

class Bookshelf {
  constructor() {
    this._books = this.retrieveFromLocalStorage() || [];
    this.init();
  }

  init() {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', event => {
      event.preventDefault();
      this.addBook();
    });

    const search = document.getElementById('searchSubmit');
    search.addEventListener('click', event => {
      event.preventDefault();
      this.searchBooks();
    });

    this.renderBooks();
  }

  get books() {
    return this._books;
  }

  addBook() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = Number(document.getElementById('year').value);
    const status = document.querySelector('input[name="status"]:checked').value;

    const book = new Book(+new Date(), title, author, year, status);
    this._books.push(book);
    this.saveToLocalStorage();
    console.log('Buku berhasil ditambahkan:', book);
    this.renderBooks();
  }

  renderBooks() {
    const shelves = {
      'Sedang dibaca': 'reading-shelf',
      'Selesai dibaca': 'finished-shelf',
      'Ingin dibaca': 'want-to-read-shelf'
    };

    for (const shelf in shelves) {
      const shelfId = shelves[shelf];
      const shelfElement = document.getElementById(shelfId);
      shelfElement.innerHTML = '';

      this._books.forEach(book => {
        if (book.status === shelf) {
          const bookElement = this.createBookElement(book);
          shelfElement.appendChild(bookElement);
          console.log(`Buku dengan judul ${book.title} berhasil ditambahkan ke rak ${shelf}`);
        }
      });
    }
  }

  createBookElement(book) {
    if (book instanceof EBook) {  // Penerapan overriding
      return this.createEBookElement(book);
    } else {
      const bookElement = document.createElement('article');
      bookElement.classList.add('bookitem');
      bookElement.dataset.bookId = book.id;
      bookElement.innerHTML = 
        `<h3>${book.title}</h3>
        <p>Penulis: ${book.author}</p>
        <p>Tahun: ${book.year}</p>`;

      const moveButton = document.createElement('button');
      moveButton.classList.add('done');
      moveButton.innerHTML = `${this.getMoveButtonIcon(book.status)}${this.getMoveButtonText(book.status)}`;
      moveButton.addEventListener('click', () => {
        this.moveBook(moveButton);
      });

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('delete');
      deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i><span class="ilang">B</span>Hapus buku';
      deleteButton.addEventListener('click', () => {
        this.removeBook(deleteButton);
      });

      bookElement.append(moveButton, deleteButton);
      bookElement.dataset.bookInfo = JSON.stringify(book);
      return bookElement;
    }
  }

  createEBookElement(ebook) {
    const bookElement = document.createElement('article');
    bookElement.classList.add('bookitem');
    bookElement.dataset.bookId = ebook.id;
    bookElement.innerHTML = 
      `<h3>${ebook.title}</h3>
      <p>Penulis: ${ebook.author}</p>
      <p>Tahun: ${ebook.year}</p>
      <p>Format: ${ebook.format}</p>`; 

    const moveButton = document.createElement('button');
    moveButton.classList.add('done');
    moveButton.innerHTML = `${this.getMoveButtonIcon(ebook.status)}${this.getMoveButtonText(ebook.status)}`;
    moveButton.addEventListener('click', () => {
      this.moveBook(moveButton);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete');
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i><span class="ilang">B</span>Hapus buku';
    deleteButton.addEventListener('click', () => {
      this.removeBook(deleteButton);
    });

    bookElement.append(moveButton, deleteButton);
    bookElement.dataset.bookInfo = JSON.stringify(ebook);
    return bookElement;
  }

  saveToLocalStorage() {
    try {
      const serializedBooks = this._books.map(book => book.toJSON());
      localStorage.setItem('books', JSON.stringify(serializedBooks));
      console.log('Data buku berhasil disimpan ke localStorage:', serializedBooks);
    } catch (error) {
      console.error('Gagal mengambil data dari localStorage:', error);
    }
  }

  retrieveFromLocalStorage() {
    try {
      const booksFromStorage = JSON.parse(localStorage.getItem('books')) || [];
      const deserializedBooks = booksFromStorage.map(book => Book.fromJSON(book));
      console.log('Data buku berhasil diambil dari localStorage:', deserializedBooks);
      return deserializedBooks;
    } catch (error) {
      console.error('Gagal mengambil data dari localStorage:', error);
      return [];
    }
  }

  moveBook(button) {
    const book = button.parentNode;
    const currentShelfId = book.parentNode.id;
    const newStatus = this.getNewStatus(currentShelfId);

    const bookId = parseInt(book.dataset.bookId);
    const foundBookIndex = this._books.findIndex(book => book.id === bookId);

    if (foundBookIndex !== -1) {
      this._books[foundBookIndex].status = newStatus;
      this.updateLocalStorage();
    }

    const shelfId = this.getShelfId(newStatus);
    const shelf = document.getElementById(shelfId);
    shelf.appendChild(book);

    button.innerHTML = `${this.getMoveButtonIcon(newStatus)}${this.getMoveButtonText(newStatus)}`;
  }

  removeBook(button) {
    const book = button.parentNode;
    const shelfId = book.parentNode.id;

    const bookId = parseInt(book.dataset.bookId);
    const foundBookIndex = this._books.findIndex(book => book.id === bookId);

    if (foundBookIndex !== -1) {
      this._books.splice(foundBookIndex, 1);
      this.updateLocalStorage();
    }

    book.parentNode.removeChild(book);
  }

  updateLocalStorage() {
    localStorage.setItem('books', JSON.stringify(this._books));
    console.log(this.updateLocalStorage);
  }

  getShelfId(status) {
    if (status === 'Sedang dibaca') {
      return 'reading-shelf';
    } else if (status === 'Selesai dibaca') {
      return 'finished-shelf';
    } else {
      return 'want-to-read-shelf';
    }
  }

  getNewStatus(currentShelfId) {
    if (currentShelfId === 'reading-shelf') {
      return 'Selesai dibaca';
    } else if (currentShelfId === 'finished-shelf') {
      return 'Sedang dibaca';
    } else {
      return 'Sedang dibaca';
    }
  }

  getMoveButtonText(status) {
    if (status === 'Sedang dibaca') {
      return 'Selesai dibaca';
    } else if (status === 'Selesai dibaca') {
      return 'Baca lagi';
    } else {
      return 'Sedang dibaca';
    }
  }

  getMoveButtonIcon(status) {
    if (status === 'Sedang dibaca') {
      return '<i class="fa-solid fa-check"></i><span class="ilang">B</span>';
    } else if (status === 'Selesai dibaca') {
      return '<i class="fa-solid fa-arrow-up"></i><span class="ilang">B</span>';
    } else {
      return '<i class="fa-solid fa-arrow-up"></i><span class="ilang">B</span>';
    }
  }

  searchBooks() {
    const searchInput = document.getElementById('searchBook').value.toLowerCase();
    const books = Array.from(document.querySelectorAll('.bookitem'));

    books.forEach(book => {
      const title = book.querySelector('h3').textContent.toLowerCase();
      const isVisible = title.includes(searchInput);
      book.style.display = isVisible ? 'block' : 'none';
    });
  }
}

const bookshelfApp = new Bookshelf();