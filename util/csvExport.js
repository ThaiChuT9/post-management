const createCsvwriter = require('csv-writer').createObjectCsvWriter;

exports.exportsToCsv = async (post, filePath = 'posts.csv') => {
    const csvWriter = createCsvwriter({
        filePath,
        header: [
            { id: 'id', title: 'ID' },
            { id: 'title', title: 'Title' },
            { id: 'content', title: 'Content' },
            { id: 'category', title: 'Category' },
            { id: 'author', title: 'Author' },
            { id: 'createdAt', title: 'Created At' }
        ]
    });

    const records = post.map(post => ({
        id: post._id,
        title: post.title,
        content: post.content,
        category: post.category,
        author: post.author.username,
        createdAt: post.createdAt.toISOString()
    }));

    await csvWriter.writeRecords(records);
    console.log(`CSV file created at ${filePath}`);
}
