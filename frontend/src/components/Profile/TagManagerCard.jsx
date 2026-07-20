export default function TagManagerCard({
    title,
    placeholder,
    tags,
    inputValue,
    setInputValue,
    onAddTag,
    onRemoveTag,
    isEditing,
    emptyMessage,
    options
}) {
    const showCheckboxes = isEditing && options;

    return (
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>{title}</label>
            
            {showCheckboxes ? (
                <div className="checkboxes-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {options.map(opt => {
                        const isChecked = tags.includes(opt);
                        return (
                            <label 
                                key={opt} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    cursor: 'pointer', 
                                    fontSize: '14px', 
                                    textTransform: 'none', 
                                    fontWeight: 'normal', 
                                    color: 'var(--text-h)',
                                    padding: '4px 0'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onAddTag(opt);
                                        } else {
                                            onRemoveTag(opt);
                                        }
                                    }}
                                    style={{ 
                                        width: '16px', 
                                        height: '16px', 
                                        cursor: 'pointer',
                                        accentColor: 'var(--accent)'
                                    }}
                                />
                                {opt}
                            </label>
                        );
                    })}
                </div>
            ) : (
                <>
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
                                        onAddTag(inputValue);
                                    }
                                }}
                            />
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => onAddTag(inputValue)}
                            >
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
                </>
            )}
        </div>
    );
}
