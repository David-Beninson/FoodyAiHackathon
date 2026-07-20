import { useState, useEffect } from 'react';
import TagManagerCard from './TagManagerCard';

export default function AddFamilyMemberModal({ isOpen, onClose, onSave, memberData }) {
    const [newMember, setNewMember] = useState(() => ({
        name: memberData?.name || '',
        age: memberData?.age !== undefined ? memberData.age : '',
        weight: memberData?.weight !== undefined ? memberData.weight : '',
        height: memberData?.height !== undefined ? memberData.height : '',
        gender: memberData?.gender || 'male',
        activity_level: memberData?.activity_level || 'moderately_active',
        goals: memberData?.goals || [],
        allergies: memberData?.allergies || [],
        preferences: memberData?.preferences || []
    }));

    const [newMemberTagInputs, setNewMemberTagInputs] = useState({
        goals: '',
        allergies: '',
        preferences: ''
    });

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleModalInputChange = (field, val) => {
        const isNumeric = ['age', 'weight', 'height'].includes(field);
        setNewMember(prev => ({
            ...prev,
            [field]: isNumeric ? (val === '' ? '' : Number(val)) : val
        }));
    };

    const addModalTag = (type, val) => {
        const valueToUse = val !== undefined ? val : newMemberTagInputs[type];
        const trimmed = (valueToUse || '').trim();
        if (!trimmed) return;
        setNewMember(prev => {
            const currentList = prev[type] || [];
            if (!currentList.includes(trimmed)) {
                return {
                    ...prev,
                    [type]: [...currentList, trimmed]
                };
            }
            return prev;
        });
        setNewMemberTagInputs(prev => ({ ...prev, [type]: '' }));
    };

    const removeModalTag = (type, tagToRemove) => {
        setNewMember(prev => ({
            ...prev,
            [type]: (prev[type] || []).filter(t => t !== tagToRemove)
        }));
    };

    const handleSaveMember = () => {
        if (!newMember.name.trim()) {
            alert('Please enter a name for the family member.');
            return;
        }

        const finalMember = {
            ...newMember,
            age: newMember.age === '' ? 25 : Number(newMember.age),
            weight: newMember.weight === '' ? 70 : Number(newMember.weight),
            height: newMember.height === '' ? 170 : Number(newMember.height)
        };

        onSave(finalMember);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Add Family Member</h3>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter name (e.g. John)"
                            value={newMember.name}
                            onChange={(e) => handleModalInputChange('name', e.target.value)}
                        />
                    </div>

                    <div className="family-member-grid">
                        <div className="form-group">
                            <label>Age</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Age (e.g. 28)"
                                value={newMember.age}
                                onChange={(e) => handleModalInputChange('age', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                className="form-control"
                                value={newMember.gender}
                                onChange={(e) => handleModalInputChange('gender', e.target.value)}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Weight (e.g. 70)"
                                value={newMember.weight}
                                onChange={(e) => handleModalInputChange('weight', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Height (cm)</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Height (e.g. 175)"
                                value={newMember.height}
                                onChange={(e) => handleModalInputChange('height', e.target.value)}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Activity Level</label>
                            <select
                                className="form-control"
                                value={newMember.activity_level}
                                onChange={(e) => handleModalInputChange('activity_level', e.target.value)}
                            >
                                <option value="sedentary">Sedentary</option>
                                <option value="lightly_active">Lightly Active</option>
                                <option value="moderately_active">Moderately Active</option>
                                <option value="very_active">Very Active</option>
                                <option value="extremely_active">Extremely Active</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                        <TagManagerCard
                            title="Goals"
                            placeholder="Select goal..."
                            tags={newMember.goals || []}
                            inputValue={newMemberTagInputs.goals}
                            setInputValue={(val) => setNewMemberTagInputs(prev => ({ ...prev, goals: val }))}
                            onAddTag={(val) => addModalTag('goals', val)}
                            onRemoveTag={(tag) => removeModalTag('goals', tag)}
                            isEditing={true}
                            emptyMessage="No goals selected"
                            options={['lose weight', 'gain muscle', 'eat healthier']}
                        />

                        <TagManagerCard
                            title="Allergies"
                            placeholder="Add allergy (e.g. peanuts)..."
                            tags={newMember.allergies || []}
                            inputValue={newMemberTagInputs.allergies}
                            setInputValue={(val) => setNewMemberTagInputs(prev => ({ ...prev, allergies: val }))}
                            onAddTag={(val) => addModalTag('allergies', val)}
                            onRemoveTag={(tag) => removeModalTag('allergies', tag)}
                            isEditing={true}
                            emptyMessage="No allergies"
                        />

                        <TagManagerCard
                            title="Dietary Preferences"
                            placeholder="Add preference (e.g. vegetarian)..."
                            tags={newMember.preferences || []}
                            inputValue={newMemberTagInputs.preferences}
                            setInputValue={(val) => setNewMemberTagInputs(prev => ({ ...prev, preferences: val }))}
                            onAddTag={(val) => addModalTag('preferences', val)}
                            onRemoveTag={(tag) => removeModalTag('preferences', tag)}
                            isEditing={true}
                            emptyMessage="No preferences"
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveMember}
                    >
                        Save Member
                    </button>
                </div>
            </div>
        </div>
    );
}
