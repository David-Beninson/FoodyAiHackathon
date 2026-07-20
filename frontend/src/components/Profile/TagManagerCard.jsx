export default function TagManagerCard({
    title,
    placeholder,
    tags,
    inputValue,
    setInputValue,
    onAddTag,
    onRemoveTag,
    isEditing,
    emptyMessage
}) {
    return (
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>{title}</label>
            {isEditing && (
                <div className="tag-input-wrapper">
                    <input
                        type="text"
                        className="form-control"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onAddTag();
                            }
                        }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={onAddTag}>
                        Add
                    </button>
                </div>
            )}
            <div className="tags-container">
                {tags.length === 0 ? (
                    <span style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{emptyMessage}</span>
                ) : (
                    tags.map(tag => (
                        <span key={tag} className="tag">
                            {tag}
                            {isEditing && (
                                <button
                                    type="button"
                                    className="tag-remove"
                                    onClick={() => onRemoveTag(tag)}
                                    aria-label={`Remove ${tag}`}
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    ))
                )}
            </div>
        </div>
    );
}
