export const AuthorAndDate = ({frontmatter}: {frontmatter: {author: string; authorLink: string; publishedOn: string}}) => {
    const date = new Date(`${frontmatter.publishedOn}T00:00:00-05:00`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return (
        <div style={{marginBottom: '1.5rem'}}>
            by <a style={{textDecoration: 'wavy underline', textDecorationThickness: '.75px'}} href={frontmatter.authorLink} target="_blank" rel="noopener noreferrer">{frontmatter.author}</a> on {date}
        </div>
    );
};
