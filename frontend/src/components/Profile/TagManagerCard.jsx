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
        <div className="form-group tag-manager-group">
            <label>{title}</label>
            
            {showCheckboxes ? (
                <div className="checkboxes-wrapper">
                    {options.map(opt => {
                        const isChecked = tags.includes(opt);
                        return (
                            <label key={opt} className="checkbox-label">
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
                                    className="checkbox-input"
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
                            <span className="empty-tags-message">{emptyMessage}</span>
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
