import { useState } from 'react';
import AddFamilyMemberModal from './AddFamilyMemberModal';

export default function FamilySettingsCard({
    currentProfile,
    isEditing,
    handleToggleFamilyMode,
    handleAddFamilyMember,
    handleRemoveFamilyMember,
    handleUpdateFamilyMember,
    handleStartEdit
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [editIndex, setEditIndex] = useState(null);

    return (
        <div className="card">
            <h2 className="card-title">Family Settings</h2>

            <div className="family-toggle-container">
                <span style={{ fontWeight: 600 }}>Enable Family Mode</span>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={currentProfile.is_family_mode || false}
                        onChange={(e) => {
                            if (!isEditing && handleStartEdit) {
                                handleStartEdit();
                            }
                            handleToggleFamilyMode(e.target.checked);
                        }}
                    />
                    <span className="slider"></span>
                </label>
            </div>

            {currentProfile.is_family_mode && (
                <div className="family-members-section">
                    {(!currentProfile.family_members || currentProfile.family_members.length === 0) ? (
                        <p style={{ color: 'var(--text)', fontSize: '14px', margin: '12px 0' }}>
                            No family members added yet.
                        </p>
                    ) : (
                        currentProfile.family_members.map((member, idx) => (
                            <div className="family-member-card" key={idx} style={{ textAlign: 'left' }}>
                                <div
                                    className="family-member-header"
                                    onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                                        {member.name || `Member #${idx + 1}`} {expandedIndex === idx ? '▲' : '▼'}
                                    </span>
                                    {isEditing && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditIndex(idx);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFamilyMember(idx);
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {expandedIndex === idx && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', fontSize: '13px', color: 'var(--text)', marginTop: '12px' }}>
                                            <div><strong>Age:</strong> {member.age}</div>
                                            <div><strong>Gender:</strong> {member.gender}</div>
                                            <div><strong>Weight:</strong> {member.weight} kg</div>
                                            <div><strong>Height:</strong> {member.height} cm</div>
                                            <div style={{ gridColumn: 'span 2' }}><strong>Activity:</strong> {member.activity_level ? member.activity_level.replace('_', ' ') : ''}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginTop: '8px', borderTop: '1px solid #222', paddingTop: '8px' }}>
                                            {member.goals && member.goals.length > 0 && (
                                                <div><strong style={{ color: 'var(--text-h)' }}>Goals:</strong> {member.goals.join(', ')}</div>
                                            )}
                                            {member.allergies && member.allergies.length > 0 && (
                                                <div><strong style={{ color: 'var(--text-h)' }}>Allergies:</strong> {member.allergies.join(', ')}</div>
                                            )}
                                            {member.preferences && member.preferences.length > 0 && (
                                                <div><strong style={{ color: 'var(--text-h)' }}>Preferences:</strong> {member.preferences.join(', ')}</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}

                    {isEditing && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ marginTop: '16px', width: '100%', padding: '12px' }}
                            onClick={() => {
                                setEditIndex(null);
                                setIsModalOpen(true);
                            }}
                        >
                            + Add Family Member
                        </button>
                    )}
                </div>
            )}

            <AddFamilyMemberModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditIndex(null);
                }}
                onSave={(member) => {
                    if (editIndex !== null) {
                        handleUpdateFamilyMember(editIndex, member);
                    } else {
                        handleAddFamilyMember(member);
                    }
                }}
                memberData={editIndex !== null ? currentProfile.family_members[editIndex] : null}
            />
        </div>
    );
}
