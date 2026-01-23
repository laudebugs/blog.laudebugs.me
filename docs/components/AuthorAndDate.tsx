export const AuthorAndDate = ({frontmatter}: {frontmatter: {author: string; authorLink: string; publishedOn: string}}) => {
    const date = new Date(frontmatter.publishedOn).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return (
        <div style={{marginBottom: '1.5rem'}}>
            By <a href={frontmatter.authorLink} target="_blank" rel="noopener noreferrer">{frontmatter.author}</a> on {date}
        </div>
    );
};
